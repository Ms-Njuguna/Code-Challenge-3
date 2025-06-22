document.addEventListener('DOMContentLoaded', main);


function main () {
    const BASE_URL = 'http://localhost:3000/posts'
    // const blogDisplay = document.querySelector('#blog-display')
    const blogList = document.querySelector('.blogList-Ul');
    const postsCounter = document.querySelector('.numberOfPosts')

    fetch(`${BASE_URL}`)
    .then(res => res.json())
    .then(posts => {
        posts.forEach(post => {
            displayBlogList(post)
        });

        //showing the first blog in the blog list every time the user visits the site or refreshes the page
        if (posts.length > 0) {
           displayBlogPost(posts[0]);
        } 

        blogListCounter();
    })

    //displaying the blog names, author and date added to the blog list
    function displayBlogList(post) {
        const postListItem = document. createElement('li');
        postListItem.dataset.id = post.id; 
        postListItem.className = 'postListItem'
        postListItem.innerHTML = `
           <p>${post.name}</p>
           <p>${post.author}  • ${post.date}</p>
        `

        //allows the blog clicked in the blog list to appear in the blog display
        postListItem.addEventListener('click', () => displayBlogPost(post));
        blogList.appendChild(postListItem);

        blogListCounter();

    }

    //allowing different functionalities for the blog display section
    function displayBlogPost(post) {
        console.log(post);

        //adding the blog card logic
        const blogCard = document.querySelector('#blogDisplayCard');
        blogCard.innerHTML = `
            <div id="topPartOfBlogDisplay">
                <div id="blogDisplayTopInfo">
                    <p>${post.name}</p>
                    <p>By ${post.author}  • ${post.date}</p>
                </div>
                <div id="blogDisplayButtons">
                    <button id="editBtn"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg> Edit</button>
                    <button id="deleteButton"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg> Delete</button>
                </div>
            </div>
            <img src="${post.image_url}" alt="interior design photo" id="blogPhoto">
            <p id="blogDisplayBottomInfo">${post.description}</p>
        `  

        //this is the edit button logic
        const editButton = document.querySelector('#editBtn');
        editButton.addEventListener('click', () => {
            const blogCard = document.querySelector('#blogDisplayCard')
            const editPostForm = document.querySelector('#edit-post-form')
            blogCard.classList.add('hidden')
            editPostForm.classList.remove('hidden')

            const editPostDetails = document.querySelector('#post-details');
            editPostDetails.innerHTML = `By ${post.author}  • ${post.date}`

            document.getElementById('edit-title').value = post.name;
            document.getElementById('edit-imageURL').value = post.image_url;
            document.getElementById('edit-content').value = post.description;

             
            document.getElementById('edit-post-form').dataset.postId = post.id;
        })
        

        //this is the delete button logic
        const deleteButton = document.querySelector('#deleteButton')
        deleteButton.addEventListener('click', () => {
            if (confirm("You are about to delete this post. Are you sure you want to proceed?")) {
                //deleting the particular blog with the specific id from the db.json file
                fetch(`${BASE_URL}/${post.id}`, {
                   method : 'DELETE'
                })
                .then(() => {
                    //removes the deleted blog info from the blog list
                    const listBlogs = blogList.querySelectorAll('.postListItem');
                    listBlogs.forEach(item => {
                        if (item.textContent.includes(post.name)) {
                            item.remove();
                        }
                    });

                    //displaying the first blog in the blog display, that appears once the blog list is updated
                    blogCard.innerHTML = '';
                    const firstItem = blogList.querySelector('.postListItem');
                    if (firstItem) {
                        fetch(`${BASE_URL}/${firstItem.dataset.id}`)
                        .then(res => res.json())
                        .then(displayBlogPost)
                        .catch(console.log(error));
                    } 

                    blogListCounter();
                })
                .catch(error => console.log(error));
            }
        })
    }

    //to make sure the data is updated once the edit form is submitted
    const saveBtn = document.querySelector('#complete-edit');
    const blogCard = document.querySelector('#blogDisplayCard');
    saveBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const editPostForm = document.querySelector('#edit-post-form')
        const postId = editPostForm.dataset.postId;

        const updatedPost = {
            name: document.getElementById('edit-title').value,
            image_url: document.getElementById('edit-imageURL').value,
            description: document.getElementById('edit-content').value
        };

        fetch(`${BASE_URL}/${postId}`, {
            method: 'PATCH',
            headers: {
            'Content-Type': 'application/json',
            Accept : 'application/json'
            },
            body: JSON.stringify(updatedPost)
        })
        .then(res => res.json())
        .then(updated => {
            displayBlogPost(updated);
            alert("Post updated successfully!");
        })
        .catch(error => console.error("Failed to update post:", error));

        blogCard.classList.remove('hidden')
        editPostForm.classList.add('hidden')
        
    })

    function blogListCounter() {
        //the counter takes in the lenght of the children of the menu list and checks some conditions
        const count = blogList.children.length;
        postsCounter.textContent = `${count} Blog Posts`

        if(count === 0) {
            //a message to the user to inform them that there are no blog posts to display in the blog list
            const noBlogsMsg = document.createElement('p')
            noBlogsMsg.className = 'noBlogAvailableMsg'
            noBlogsMsg.textContent = 'No blog posts available'

            blogList.appendChild(noBlogsMsg);

            const rightSide = document.querySelector('.right-side')
            rightSide.classList.add('hidden');
        } else {
            //displays the blog display if there are more than 0 blogs available
            const rightSide = document.querySelector('.right-side')
            rightSide.classList.remove('hidden');
        }
    }

    //this hides the addPost button on click and displays the addBlog form in it's place
    const addPostButton = document.querySelector('#addBlogPostBtn')
    addPostButton.addEventListener('click', () => {
        const addBlogPostForm = document.querySelector('.addBlogPostForm')
        addPostButton.classList.add('hidden')
        addBlogPostForm.classList.remove('hidden')
    })



    //logic for the add post button in the add post form that updates/submits the new blog information to my app
    const finaliseAddPostButton = document.querySelector('#proceed-addPost-Btn')
    finaliseAddPostButton.addEventListener('click', finaliseAddPost)

    function finaliseAddPost(e) {
        e.preventDefault()

        const addBlogPostForm = document.querySelector('.addBlogPostForm')
        const nameInput = document.querySelector("#addTitle")
        const authorInput = document.querySelector("#addAuthorName")
        const imageInput = document.querySelector("#addImage")
        const postDescriptionInput = document.querySelector("#addPostContent")
        const dateAdded = new Date().toISOString().split('T')[0];

        addBlogPostForm.classList.add('hidden')
        addPostButton.classList.remove('hidden')

        //using POST to add a blog to my db.json file
        fetch(`${BASE_URL}`, {
            method : "POST",
            headers : {
                "Content-Type" : "application/json",
                Accept : "application/json"
            },
            body : JSON.stringify({
                name : nameInput.value,
                author : authorInput.value,
                image_url : imageInput.value,
                date : dateAdded,
                description : postDescriptionInput.value
            })
        })
        .then(res => res.json())
        .then(newPost => {
            //this immeadiately displays the added blog in the blog list and also updates the counter accordingly
            displayBlogList(newPost);       
            blogListCounter(); 
        })

        //resetting the input for the form
        nameInput.value = '';
        authorInput.value = '';
        imageInput.value = '';
        postDescriptionInput.value = '';
    }

    //this reveals the addPost button on click and hides the addBlog form - nothing else happens
    const cancelAddPostButton = document.querySelector('#cancel-addPost-Btn')
    cancelAddPostButton.addEventListener('click', cancelPostAddition)

    function cancelPostAddition() {
        addBlogPostForm.classList.add('hidden')
        addPostButton.classList.remove('hidden') 
    }

};

