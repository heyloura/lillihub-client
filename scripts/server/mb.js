export async function getCheckData(token) {
    const fetching = await fetch('https://micro.blog/posts/check', {
        method: "GET",
        headers: { "Authorization": "Bearer " + token }
    });
    try {
        return await fetching.json();
    } catch {
        return null;
    }
}

export async function setMarker(channel, id, token) {
    const form = new URLSearchParams();
    form.append("channel", channel);
    form.append("id", String(id));
    form.append("date_marked", new Date().toISOString());
    await fetch('https://micro.blog/posts/markers', {
        method: "POST",
        body: form.toString(),
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
        }
    });
}

// In-memory conversation cache with 5-minute TTL and LRU size cap.
// Avoids redundant API calls when the same conversation appears via multiple
// timeline items, and keeps conversations warm across post-action redirects.
// Relies on Map's insertion-order iteration: reads promote by re-inserting,
// writes evict the oldest key when we exceed CONVO_CACHE_MAX.
const _convoCache = new Map();
const CONVO_TTL = 300_000;
const CONVO_CACHE_MAX = 500;

export async function getConversation(id, token, skipCache = false) {
    if (!skipCache) {
        const cached = _convoCache.get(id);
        if (cached && Date.now() - cached.time < CONVO_TTL) {
            // Promote to most-recently-used
            _convoCache.delete(id);
            _convoCache.set(id, cached);
            return cached.data;
        }
        // Expired — drop so stale keys don't pin cache slots
        if (cached) _convoCache.delete(id);
    }

    try {
        const fetching = await fetch(`https://micro.blog/posts/conversation?id=${id}`, { method: "GET", headers: { "Authorization": "Bearer " + token } });
        const data = await fetching.json();
        _convoCache.set(id, { data, time: Date.now() });
        // LRU eviction: if over cap, drop the oldest entry (first-inserted key)
        if (_convoCache.size > CONVO_CACHE_MAX) {
            const oldestKey = _convoCache.keys().next().value;
            _convoCache.delete(oldestKey);
        }
        return data;
    }
    catch {
        return null;
    }
}

export async function getFollowingList(username, token) {
    try {
        const fetching = await fetch(`https://micro.blog/users/following/${username}`, {
            method: "GET",
            headers: { "Authorization": "Bearer " + token }
        });
        const users = await fetching.json();
        return new Set(users.map(u => u.username));
    } catch {
        return new Set();
    }
}

export async function getMicroBlogLoggedInUser(access_token) {
    const formBody = new URLSearchParams();
    formBody.append("token", access_token);

    const fetching = await fetch('https://micro.blog/account/verify', {
        method: "POST",
        body: formBody.toString(),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
            "Accept": "application/json"
        }
    });
    return await fetching.json();
}