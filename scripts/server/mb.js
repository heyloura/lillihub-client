// KEEP THIS FILE

//*************************************************************
// Micro.blog helper functions...
// - flattenedPost: get flat object back
// - getMicroBlogUser: gets the user from Micro.blog
// - getMicroBlogDiscoverPosts: gets micro.blog discover posts
//*************************************************************

// Takes a post object returned from M.B. and then
// flattens it like a pancake.
export function flattenedMicroBlogPost(post) {
    return {
        id: post && post.id ? post.id : 0,
        content: post &&  post.content_html ? post.content_html : '',
        url: post &&  post.url ? post.url : '',
        published: post &&  post.date_published ? post.date_published : '',
        name: post &&  post.author && post.author.name ? post.author.name : '',
        authorUrl: post &&  post.author && post.author.url ? post.author.url : '',
        avatar: post &&  post.author && post.author.avatar ? post.author.avatar : '',
        username: post &&  post.author && post.author._microblog && post.author._microblog.username ? post.author._microblog.username : '',
        relative: post &&  post._microblog && post._microblog.date_relative ? post._microblog.date_relative : '',
        timestamp: post &&  post._microblog && post._microblog.date_timestamp ? post._microblog.date_timestamp : '',
        favorite: post &&  post._microblog && post._microblog.is_favorite ? post._microblog.is_favorite : false,
        bookmark: post &&  post._microblog && post._microblog.is_bookmark ? post._microblog.is_bookmark : false,
        deletable: post &&  post._microblog && post._microblog.is_deletable ? post._microblog.is_deletable : false,
        conversation: post &&  post._microblog && post._microblog.is_conversation ? post._microblog.is_conversation : false,
        linkpost: post && post._microblog && post._microblog.is_linkpost ? post._microblog.is_linkpost : false,
        mention: post && post._microblog && post._microblog.is_mention ? post._microblog.is_mention : false,
    };
}

// Gets information about the M.B. user
export async function getMicroBlogUser(access_token) {
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
    const result = await fetching.json();
    if(result.error) {
      return undefined;
    }
    return result;
}

// Gets the Micro.Blog discover posts
export async function getMicroBlogDiscoverPosts(access_token) {
    // the discover endpoint does not support paging.
    return await __getMicroBlogPosts(access_token, 'https://micro.blog/posts/discover');
}

async function __getMicroBlogPosts(access_token, url, lastId, count) {
    try {
        const guard = count ? Math.ceil(count / 40) : 1; // prevent infinite loops
        let loop = 0;
        let items = [];
        lastId = lastId ?? 0;
        while(loop < guard && items.length < count) {
            loop++;
            
            let fetchMe = url;
            if(lastId || count) {
                fetchMe = `${fetchMe}?${lastId ? `before_id=${lastId}${lastId && count ? '&' : ''}${count ? `count=${count}` : ''}` : ''}`;
            }

            if(access_token) {
                const fetching = await fetch(fetchMe, { 
                    method: "GET", 
                    headers: { "Authorization": "Bearer " + access_token } 
                });
                const results = await fetching.json();          
                items = [...items, ...results.items];
            } else {
                const fetching = await fetch(fetchMe, { 
                    method: "GET", 
                });
                const results = await fetching.json(); 
                items = [...items, ...results.items];
            }

        }
        return items; 
    } catch {
        return undefined; 
    }
}