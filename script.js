// SIFT THROUGH IMMENSE DATABASE FOR USER DATA
function fetchUserProfile(userId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() < 0.3) {
                reject(new Error('Failed to fetch profile'));
            return;
            }
            const user = {
                id: userId,
                name: "Steve McAwesome",
                email: "McAwesomeS@gmail.com",
                username: "AwesomeGaming1987",
            };
            resolve(user);
        }, 1000); //1000 = 1.0s
    });
}


// SIFT THROUGH IMMENSE DATABASE FOR POSTS
function fetchUserPosts(userId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() < 0.3) {
                reject(new Error('Failed to fetch posts'));
            return;
            }
            const posts = [
                {postId: 1, userId: userId, title: "look at this awesome fish guys", content: "image of fish"},
                {postId: 2, userId: userId, title: "guys I think this fish can speak", content: "video of fish making sounds"},
                {postId: 3, userId: userId, title: "nvm guys it ate a speaker", content: "image of fish again"}
            ];
            resolve(posts);
        }, 1500); //1.5s
    });
}


// SIFT THROUGH THE IMMENSE DATABASE FOR THE COMMENTS ON THE POSTS (VERY INEFFICENTLY, CLEARLY)
function fetchPostComments(postId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() < 0.3) {
                reject(new Error('Failed to fetch comments'));
            return;
            }

            const comments = [
                {commentId: 1, postId: postId, username: "James", comment: "Wow that's a big fish right ther."},
                {commentId: 2, postId: postId, username: "BobJ0e23", comment: "anyone here know what fish this is?"},
                {commendId: 3, postId: postId, username: "qwertyuiop", comment: "WOAH!"}
            ];
            resolve(comments);
        }, 2000); //2s
    });
}


// DATA FETCHING SEQUENTIALLY
async function fetchDataSequentially(userId) {
    console.log("Starting Sequential Fetch...");
    const startTime = Date.now();

    const data = {
        user: undefined,
        posts: undefined,
        comments: undefined,
    };

    try {
        //USER PROFILE
        const userData = await fetchUserProfile(userId);
        console.log("User Profile retrieved");
        data.user = userData
    } catch (error) {
        console.error("Error 1 in sequential fetch:", error.message);
    }

    try {
        //USER POSTS
        const postData = await fetchUserPosts(userId);
        console.log("Post data retrieved.");
        data.posts = postData

        //POST COMMENTS
        const commentData = []; //Init
        for (const post of data.posts) { //Iterate through posts
            try {
                commentData.push(await fetchPostComments(post.postId));
                console.log(`Post ${post.postId}: comments retrieved successfully.`);
                data.comments = commentData
            } catch(error) {
                console.error(`Error fetching comments:`, error.message)
            }
        };

    } catch (error) {
        console.error("Error 2 in sequential fetch:", error.message);
    }

    const endTime = Date.now();
    console.log(`Sequential fetch took ${endTime-startTime}ms`);

    return data; // Return data
}


// PARALLEL DATA FETCHING 
async function fetchDataParallel(userId) {
    console.log("Starting parallel fetch...");
    const startTime = Date.now();

    const data = {
        user: undefined,
        posts: undefined,
        comments: undefined,
    }

    try {
        //Fetch user and post data
        const [userData, postData] = await Promise.all([
            fetchUserProfile(userId),
            fetchUserPosts(userId)
        ]);
        data.user = userData
        data.posts = postData
        console.log("User and post data retrieved successfully.")

        //Fetch post comments
        const commentData = [];

        await Promise.all(data.posts.map(async post => {
            try {
                commentData.push(await fetchPostComments(post.postId))
                console.log(`Post ${post.postId}: comments retrieved successfully.`);
                data.comments = commentData
            } catch(error) {
                console.error("Error 2 in parallel fetch:", error.message);
            }
        }));

        

    } catch(error) {
        console.error("Error 1 in parallel fetch:", error.message);
    }

    const endTime = Date.now();
    console.log(`Parallel fetch took ${endTime-startTime}ms`);
    return data

}

//I don't get why we need to make a 'master' function when the two above already do everything, so I refuse.


//CONNECT TO BUTTONS
const output = document.getElementById("output");

document.getElementById("sequential").addEventListener("click", async function() {
    const data = await fetchDataSequentially(1);

    displayData(data, output);
});

document.getElementById("parallel").addEventListener("click", async function() {
    const data = await fetchDataParallel(1);
    
    displayData(data, output);
});


// FORMAT OBJECTS TO BE DISPLAYED AS HTML ELEMENTS
function displayData(data, container) {
    container.innerHTML = "" //Clear container
    // const data = {
    //     user: undefined,
    //     posts: undefined,
    //     comments: undefined,
    // }

    let userProfile = ''
    let postsData = '' //each post will contain it's own comments

    // FORMAT USER PROFILE
    if(data.user != undefined) {
        userProfile = `
            <h1>${data.user.username}</h1>
            <p>ID: ${data.user.id}   -----   EMAIL: ${data.user.email}   -----   NAME: ${data.user.name}</p>
        ` 
    }

    if(data.posts != undefined) {
        data.posts.forEach(post => {

            let commentData = ``
            let postData = `
                <h2>${post.postId}: ${post.title}</h2>
                <h3>${post.content}</h3>
            `
            if (data.comments != undefined) {//Comments exist?
                data.comments.forEach(commentList => {
                    if(commentList[0].postId == post.postId) {
                        for(comment of commentList) {
                            commentData += `<p>${comment.username}: ${comment.comment}</p>`
                        }
                    }    
                });// The nesting...it scares me.... I'm so sorry..
            }
            postsData += postData + commentData
        });
    }
    

    container.innerHTML = userProfile + postsData
}