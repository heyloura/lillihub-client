export async function getConversation(id, token) {
    const fetching = await fetch(`https://micro.blog/posts/conversation?id=${id}`, { method: "GET", headers: { "Authorization": "Bearer " + token } });
    try {
        return await fetching.json();
    }
    catch {
        return null;
    }
}

export async function getIsFollowingUser(username, token) {
    const fetching = await fetch(`https://micro.blog/users/is_following?username=${username}`, { method: "GET", headers: { "Authorization": "Bearer " + token } });
    try {
        return await fetching.json();
    }
    catch {
        return { is_you: false, is_following: false };
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