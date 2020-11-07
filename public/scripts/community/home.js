let start = 0;
const step = 12;

$(() => {
    let tempStart = start;
    let tempStep = step;
    start += step;
    $.getJSON(`/community/posts/${start - step}/${start}`)
        .done((data) => {
            $("#loading").css({ display: "none"});
            const { posts, user } = data;
            
            posts.forEach((post, index) => {
                $("#posts-pagination").html($("#posts-pagination").html() + `
                <div class="col-12 col-lg-6 mt-4">
                    <div class="card">
                        <div class="card-body" id="${post._id}">
                            <div class="heading-3 card-title">${post.title}</div>
                            <p class="card-text para-1  ">${post.author.name}</p>
                            <p class="card-text para-2  "><i class="fas fa-map-marker-alt"></i> ${post.city}</p>
                            <p class="card-text">${post.text.substring(0, 150)}...</p>
                            <a href="community/${post._id}" class="btn btn-outline-dark">View Post</a>   
                `);

                if (user && user._id == post.author.id) {
                    $(`#posts-pagination .col-12 .card #${post._id}`).html($(`#posts-pagination .col-12 .card #${post._id}`).html() +
                    `<a href="community/${post._id}/edit" class="btn btn-outline-primary">Edit</a>
                    <a href="community/${post._id}/delete" class="btn btn-outline-danger">Delete</a>`);
                }
            });
        })
        .catch((err) => {
            start = tempStart;
            step = tempStep;
            console.log(err);
        });
});

$(window).scroll(function() {
    let tempStart = start;
    let tempStep = step;
    start += step;
    if($(window).scrollTop() + $(window).height() == $(document).height()) {
        $.getJSON(`/community/posts/${start - step}/${start}`)
        .done((data) => {
            const { posts, user } = data;
            
            posts.forEach((post, index) => {
                $("#posts-pagination").html($("#posts-pagination").html() + `
                <div class="col-12 col-lg-6 mt-4">
                    <div class="card">
                        <div class="card-body" id="${post._id}">
                            <div class="heading-3 card-title">${post.title}</div>
                            <p class="card-text para-1  ">${post.author.name}</p>
                            <p class="card-text para-1  ">${post.city}</p>
                            <p class="card-text">${post.text.substring(0, 150)}...</p>
                            <a href="community/${post._id}" class="btn btn-outline-dark">View Post</a>   
                `);

                if (user && user._id == post.author.id) {
                    $(`#posts-pagination .col-12 .card #${post._id}`).html($(`#posts-pagination .col-12 .card #${post._id}`).html() +
                    `<a href="community/${post._id}/edit" class="btn btn-outline-primary">Edit</a>
                    <a href="community/${post._id}/delete" class="btn btn-outline-danger">Delete</a>`);
                }
            });
        })
        .catch((err) => {
            start = tempStart;
            step = tempStep;
            console.log(err);
        });
    }
});


/* <img class="card-img-top" src="/community/get_image/${post._id}" onerror="this.style.display='none'"> */