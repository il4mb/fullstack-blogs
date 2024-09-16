const dummy = (blogs = []) => {
    return 1;
}

const totalLikes = (blogs = []) => {
    if (!Array.isArray(blogs) || blogs.length == 0) return 0;
    return blogs.reduce((t, b) => t + b.likes, 0);
}

const favoriteBlog = (blogs = []) => {

    if (!Array.isArray(blogs) || blogs.length == 0) return null;

    const mostLikedBlog = blogs.reduce((prev, current) => {
        return current.likes > prev.likes ? current : prev;
    });

    return {
        title: mostLikedBlog.title,
        author: mostLikedBlog.author,
        likes: mostLikedBlog.likes,
    };
};

const mostBlogs = (blogs = []) => {

    if (!Array.isArray(blogs) || blogs.length == 0) return null;

    const authorBlogCount = blogs.reduce((acc, blog) => {
        acc[blog.author] = (acc[blog.author] || 0) + 1;
        return acc;
    }, {});

    const topAuthor = Object.keys(authorBlogCount).reduce((top, author) => {
        return authorBlogCount[author] > authorBlogCount[top] ? author : top;
    });

    return {
        author: topAuthor,
        blogs: authorBlogCount[topAuthor]
    };
};

const mostLikes = (blogs = []) => {

    if (!Array.isArray(blogs) || blogs.length == 0) return null;

    // Create a map of authors and their total likes
    const authorLikesCount = blogs.reduce((acc, blog) => {
        acc[blog.author] = (acc[blog.author] || 0) + blog.likes;
        return acc;
    }, {});

    // Find the author with the most likes
    const topAuthor = Object.keys(authorLikesCount).reduce((top, author) => {
        return authorLikesCount[author] > authorLikesCount[top] ? author : top;
    });

    // Return the result in the expected format
    return {
        author: topAuthor,
        likes: authorLikesCount[topAuthor]
    };
};




module.exports = {
    dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}