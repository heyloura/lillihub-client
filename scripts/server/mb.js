// KEEP THIS FILE

//*************************************************************
// Micro.blog helper functions...
// - flattenedPost: get flat object back
// - getMicroBlogUser: gets the user from Micro.blog
// - getMicroBlogDiscoverPosts: gets micro.blog discover posts
//*************************************************************

// Takes a post object returned from M.B. and then
// flattens it like a pancake.
// export function flattenedMicroBlogPost(post) {
//     return {
//         id: post && post.id ? post.id : 0,
//         content: post &&  post.content_html ? post.content_html : '',
//         url: post &&  post.url ? post.url : '',
//         published: post &&  post.date_published ? post.date_published : '',
//         name: post &&  post.author && post.author.name ? post.author.name : '',
//         authorUrl: post &&  post.author && post.author.url ? post.author.url : '',
//         avatar: post &&  post.author && post.author.avatar ? post.author.avatar : '',
//         username: post &&  post.author && post.author._microblog && post.author._microblog.username ? post.author._microblog.username : '',
//         relative: post &&  post._microblog && post._microblog.date_relative ? post._microblog.date_relative : '',
//         timestamp: post &&  post._microblog && post._microblog.date_timestamp ? post._microblog.date_timestamp : '',
//         favorite: post &&  post._microblog && post._microblog.is_favorite ? post._microblog.is_favorite : false,
//         bookmark: post &&  post._microblog && post._microblog.is_bookmark ? post._microblog.is_bookmark : false,
//         deletable: post &&  post._microblog && post._microblog.is_deletable ? post._microblog.is_deletable : false,
//         conversation: post &&  post._microblog && post._microblog.is_conversation ? post._microblog.is_conversation : false,
//         linkpost: post && post._microblog && post._microblog.is_linkpost ? post._microblog.is_linkpost : false,
//         mention: post && post._microblog && post._microblog.is_mention ? post._microblog.is_mention : false,
//         bio: post && post._microblog && post._microblog.bio ? post._microblog.bio : ''
//     };
// }

// Gets information about the M.B. user
export async function getMicroBlogUser(accessToken) {
    const formBody = new URLSearchParams();
    formBody.append("token", accessToken);

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
// export async function getMicroBlogDiscoverPosts(accessToken) {
//     // the discover endpoint does not support paging.
//     const items = await __getMicroBlogPosts(accessToken, 'https://micro.blog/posts/discover');

//     items.map(post => {
//         if(post.content.split('<img').length > 1) {
//             const startTag = post.content.split('<img')[1];
//             const startSrc = startTag.split('src="')[1];
//             const endSrc = startSrc.split('"')[0];
//             post.image = endSrc;
//         }

//         return post;
//     });
//     return items;
// }

// export async function getMicroBlogUserOrTagmojiPosts(accessToken, id) {
//     // does not support paging.
//     const items = await __getMicroBlogPosts(accessToken, `https://micro.blog/posts/${id}`);
//     return items;
// }

export async function getMicroBlogTimelinePosts(accessToken,lastId) {
    const fetching = await fetch(`https://micro.blog/posts/check`, { method: "GET", headers: { "Authorization": "Bearer " + accessToken } } );
    const results = await fetching.json(); 
    const marker = results.markers.timeline;

    if(lastId == 'timeline') {
        lastId = 0;
    }

    let items = await __getMicroBlogPosts(accessToken, 'https://micro.blog/posts/timeline', lastId && lastId != 0 ? lastId : null, 40);

    let ids = items.map(i => i.id);
    let posts = items;
    
    let i = 0;
    console.log(marker,!ids.includes(marker.id),lastId)
    if(marker && !ids.includes(marker.id) && lastId == 0) {
        while(!ids.includes(results.markers.timeline.id) && i < 100)
        {
            console.log(posts.length, i)
            items = await __getMicroBlogPosts(accessToken, 'https://micro.blog/posts/timeline', ids[ids.length - 1], 40);

            console.log(items.length)

            if(!items || items.length == 0) {
                break;
            }

            posts = [...posts, ...items];
            ids = [...ids, ...items.map(i => i.id)];
            i++;

            if(items.length < 40) {
                break;
            }
        }
    }
    return posts;
}


// function flattenedMicroBlogPost(post) {
//     return {
//         id: post && post.id ? post.id : 0,
//         content: post &&  post.content_html ? post.content_html : '',
//         url: post &&  post.url ? post.url : '',
//         published: post &&  post.date_published ? post.date_published : '',
//         name: post &&  post.author && post.author.name ? post.author.name : '',
//         authorUrl: post &&  post.author && post.author.url ? post.author.url : '',
//         avatar: post &&  post.author && post.author.avatar ? post.author.avatar : '',
//         username: post &&  post.author && post.author._microblog && post.author._microblog.username ? post.author._microblog.username : '',
//         relative: post &&  post._microblog && post._microblog.date_relative ? post._microblog.date_relative : '',
//         timestamp: post &&  post._microblog && post._microblog.date_timestamp ? post._microblog.date_timestamp : '',
//         favorite: post &&  post._microblog && post._microblog.is_favorite ? post._microblog.is_favorite : false,
//         bookmark: post &&  post._microblog && post._microblog.is_bookmark ? post._microblog.is_bookmark : false,
//         deletable: post &&  post._microblog && post._microblog.is_deletable ? post._microblog.is_deletable : false,
//         conversation: post &&  post._microblog && post._microblog.is_conversation ? post._microblog.is_conversation : false,
//         linkpost: post && post._microblog && post._microblog.is_linkpost ? post._microblog.is_linkpost : false,
//         mention: post && post._microblog && post._microblog.is_mention ? post._microblog.is_mention : false,
//         bio: post && post._microblog && post._microblog.bio ? post._microblog.bio : ''
//     };
// }
export async function getMicroBlogTimelinePostsChronological(accessToken, lastId) {
    const fetching = await fetch(`https://micro.blog/posts/check`, { method: "GET", headers: { "Authorization": "Bearer " + accessToken } } );
    const results = await fetching.json(); 
    const marker = results.markers.timeline;

    if(lastId == 'timeline') {
        lastId = 0;
    }

    let items = await __getMicroBlogPosts(accessToken, 'https://micro.blog/posts/timeline', lastId && lastId != 0 ? lastId : null, 40);

    let ids = items.map(i => i.id);
    let posts = items;
    
    let i = 0;
    console.log(marker,!ids.includes(marker.id),lastId)
    if(marker && !ids.includes(marker.id) && lastId == 0) {
        while(!ids.includes(results.markers.timeline.id) && i < 1)
        {
            console.log(posts.length, i)
            items = await __getMicroBlogPosts(accessToken, 'https://micro.blog/posts/timeline', ids[ids.length - 1], 40);

            console.log(items.length)

            if(!items || items.length == 0) {
                break;
            }

            posts = [...posts, ...items];
            ids = [...ids, ...items.map(i => i.id)];
            i++;

            if(items.length < 40) {
                break;
            }
        }
    }
    // let reversed = posts.reverse();
    // const index = reversed.findIndex(obj => obj.id === marker.id);
    // if (index !== -1) {
    //     reversed = reversed.slice(index);
    // }
    return posts;
}

// export async function getMicroBlogDiscoverPhotoPosts(accessToken) {
//     // the discover endpoint does not support paging.
//     return (await getMicroBlogDiscoverPosts(accessToken)).filter(post => post.image);
// }

// export async function getMicroBlogConversation(accessToken, id) {
//     const items = await __getMicroBlogPosts(accessToken, `https://micro.blog/posts/conversation?id=${id}`);
//     return items.slice(0).reverse();
// }

// export async function getMicroBlogUserProfile(accessToken, username) {
//     const fetching = await fetch(`https://micro.blog/posts/${username}?count=1`, { 
//         method: "GET", 
//         headers: { "Authorization": "Bearer " + accessToken } 
//     });
//     return await fetching.json();   
// }

export async function getMicroBlogFollowing(accessToken, username, isMe = true) {
    const fetching = await fetch(isMe ? `https://micro.blog/users/following/${username}` : `https://micro.blog/users/discover/${username}`, { 
        method: "GET", 
        headers: { "Authorization": "Bearer " + accessToken } 
    });
    return await fetching.json();   
}

// for places that paging is not supported by micro.blog
export async function getAllFromMicroBlog(access_token, url) {
    let id = 0;
    let newId = -1;
    let i = 0;
    let items = [];
    let params = '';
    
  while(id != newId && i < 1000)
    {
      let params = url.split('?').length > 1 ? '?' + url.split('?')[1] : (i != 0 ? '?' : '');
      url = url.split('?').length > 1 ? url.split('?')[0] : url;

      if(i != 0 && !params) {
        params = params + `before_id=${items[items.length - 1].id}`;
      }
      if(i != 0 && params) {
        params = params + `&before_id=${items[items.length - 1].id}`;
      }

      const fetching = await fetch(`${url}${params}`, { method: "GET", headers: { "Authorization": "Bearer " + access_token } } );
      const results = await fetching.json();

      if(!results.items || results.items.length == 0) {
          break;
      }
      
      id = items.length > 0 ? items[items.length - 1].id : results.items[results.items.length - 1].id;
      newId = i == 0 ? -1 : results.items[results.items.length - 1].id;
      items = [...items, ...results.items];
      i++;

      if(results.items.length < 25) {
        break;
      }
    }
    return items;
}

async function __getMicroBlogPosts(accessToken, url, lastId, count) {
    try {
        const guard = count ? Math.ceil(count / 40) : 1; // prevent infinite loops
        let loop = 0;
        let items = [];
        lastId = lastId ?? 0;

        while(loop < guard && (!count || items.length < count)) {
            loop++;

            let fetchMe = url;
            if(lastId || count) {
                fetchMe = `${fetchMe}?${lastId ? `before_id=${lastId}${lastId && count ? '&' : ''}${count ? `count=${count}` : ''}` : ''}`;
            }

            if(accessToken) {
                const fetching = await fetch(fetchMe, { 
                    method: "GET", 
                    headers: { "Authorization": "Bearer " + accessToken } 
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
    } catch(error) {
        console.error(error);
        return undefined; 
    }
}