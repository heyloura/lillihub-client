import { HTMLPage, HTMLPageStart, HTMLPageEnd } from "./templates.js";
import { getConversation, getCheckData, setMarker, getFollowingList } from "../scripts/server/mb.js";
import { PostTemplate } from "./_post.js";
import { createLimit } from "../scripts/server/utilities.js";

const _timelineTemplate = new TextDecoder().decode(await Deno.readFile("templates/social/timeline.html"));

export async function TimelineTemplate(user, token, req) {
    const searchParams = new URLSearchParams(req.url.split('?')[1]);
    const last = searchParams.get('last');    // paginate older: before_id
    const before = searchParams.get('before'); // paginate newer: since_id

    const isPaginating = !!(last || before);

    const params = new URLSearchParams({ count: '15' });
    if (last) params.set('before_id', last);
    if (before) params.set('since_id', before);

    // On paginated loads, reuse the original read-position timestamp from the URL
    // so that new/old reply classification stays consistent across pages.
    const tsParam = searchParams.get('ts');

    // Fetch check data (only on fresh load), timeline, and following list in parallel
    const fetches = [
        isPaginating && tsParam ? Promise.resolve(null) : getCheckData(token),
        fetch(`https://micro.blog/posts/timeline?${params}`, {
            method: "GET",
            headers: { "Authorization": "Bearer " + token }
        }),
        getFollowingList(user.username, token)
    ];
    const [checkData, timelineResponse, followingSet] = await Promise.all(fetches);

    const lastTimestamp = tsParam
        ? parseInt(tsParam, 10)
        : checkData?.markers?.timeline?.date_marked
            ? Math.trunc(new Date(checkData.markers.timeline.date_marked).getTime() / 1000)
            : 0;

    const results = await timelineResponse.json();

    if (!results?.items?.length) {
        return HTMLPage(token, 'Timeline', `<p>No items returned from Micro.blog</p>`, user);
    }

    const replied = searchParams.get('replied');
    const lastPostId = results.items[results.items.length - 1].id;
    const beforeId = last ? results.items[0].id : null;

    // Update marker position on a fresh load only, not while paginating.
    // Fire-and-forget: don't await so the marker POST doesn't delay the page response.
    if (!last && !before && results.items[0]?.id) {
        setMarker('timeline', results.items[0].id, token);
    }

    // Cross-page dedup: seed the seen Set with root post IDs from previous pages
    const seenParam = searchParams.get('seen') || '';
    const seen = new Set(seenParam ? seenParam.split(',') : []);

    const encoder = new TextEncoder();

    // Build a redirect base that preserves the current pagination state so
    // that replying to a post on page 2+ doesn't jump the user back to page 1.
    // On the first page (no `last` param), redirectBase stays as '/'.
    let redirectBase = '/';
    if (last || before) {
        const rp = new URLSearchParams();
        if (last) rp.set('last', last);
        if (before) rp.set('before', before);
        if (seenParam) rp.set('seen', seenParam);
        if (tsParam) rp.set('ts', tsParam);
        redirectBase = `/?${rp.toString()}`;
    }

    // Kick off conversation fetches with bounded concurrency so we don't flood
    // the connection pool on cold-cache pages.
    const limit = createLimit(5);
    const postPromises = results.items.map((item) => limit(async () => {
        if (!item) return '';

        let convo = item;
        let conversations = [];

        if (item._microblog?.is_conversation) {
            const conversation = await getConversation(item.id, token);
            if (conversation?.items?.length > 0) {
                convo = conversation.items[conversation.items.length - 1];
                conversations = conversation.items;
            } else {
                return '';
            }
        }

        const convoId = String(convo.id);
        if (seen.has(convoId)) return '';
        seen.add(convoId);

        return PostTemplate(item.id, convo, conversations, user, token, lastTimestamp, '', false, true, false, followingSet, redirectBase);
    }));

    const stream = new ReadableStream({
        async start(controller) {
            try {
                // Send the page shell immediately — user sees nav + layout instantly
                controller.enqueue(encoder.encode(HTMLPageStart(token, 'Timeline', user)));

                // Stream each post in order as it resolves. A `.stream-dots`
                // div is flushed before each await so it's visible during the
                // gap; CSS (`:not(:last-child)`) auto-hides it the instant the
                // next post appends after it. Pure HTML + CSS, no JS.
                for (const promise of postPromises) {
                    controller.enqueue(encoder.encode('<div class="stream-dots"></div>'));
                    let postHTML = await promise;
                    if (postHTML) {
                        // Apply replied highlight if needed
                        if (replied) {
                            postHTML = postHTML.replace(
                                `class="card mt-2" id="post-${replied}"`,
                                `class="card mt-2 replied" id="post-${replied}"`
                            );
                        }
                        controller.enqueue(encoder.encode(postHTML));
                    }
                }

                // Build the seen param for paging links (all root IDs across all pages)
                const seenStr = [...seen].join(',');

                // Send paging footer
                const paging = _timelineTemplate
                    .replaceAll('{{feed}}', '')
                    .replaceAll('{{before}}', beforeId ? '' : 'disabled')
                    .replaceAll('{{beforeId}}', beforeId ?? '')
                    .replaceAll('{{lastId}}', lastPostId)
                    .replaceAll('{{seen}}', seenStr)
                    .replaceAll('{{ts}}', String(lastTimestamp));
                controller.enqueue(encoder.encode(paging));

                // Send page end (bottom nav, FAB, scripts, closing tags)
                controller.enqueue(encoder.encode(HTMLPageEnd(user)));

                controller.close();
            } catch (e) {
                controller.error(e);
            }
        }
    });

    return stream;
}
