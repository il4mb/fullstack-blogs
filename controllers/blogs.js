const blogRouters = require('express').Router();
const Blog = require('../models/blog');
const middleware = require('../utils/middleware');

const getTokenFrom = request => {
    const authorization = request.get('authorization');
    if (authorization && authorization.startsWith('Bearer ')) {
        return authorization.replace('Bearer ', '');
    }
    return null;
}

blogRouters.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate("user", { username: 1, name: 1, id: 1 });
    response.json(blogs);
});

blogRouters.get('/:id', (request, response, next) => {
    Blog.findById(request.params.id)
        .then(note => {
            if (note) {
                response.json(note)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
});

blogRouters.post('/', middleware.userExtractor, async (request, response, next) => {

    const user = request.user;
    if (!user) {
        return response.status(401).json({ error: 'User missing or invalid' });
    }

    try {

        const { title, author, url, likes } = request.body;

        const blog = new Blog({ title, author, url, likes, user: user.id.toString() });

        const savedBlog = await blog.save();
        user.blogs = user.blogs.concat(savedBlog.id);
        await user.save();

        response.status(201).json(savedBlog);

    } catch (error) {
        next(error);
    }
});

blogRouters.delete('/:id', middleware.userExtractor, async (request, response, next) => {

    const user = request.user;
    if (!user) {
        return response.status(401).json({ error: 'User missing or invalid' });
    }

    try {

        const blog = await Blog.findById(request.params.id);

        if (!blog) {
            return response.status(404).json({ error: 'Blog not found' });
        }

        // Check if the user making the request is the owner of the blog
        if (blog.user.toString() !== user.id.toString()) {
            return response.status(403).json({ error: 'Permission denied' });
        }

        await Blog.findByIdAndDelete(request.params.id);
        user.blogs = (user.blogs || []).filter(i => i !== request.params.id);
        await user.save();

        response.status(204).end();
    } catch (error) {
        next(error);
    }
});

blogRouters.put('/:id', middleware.userExtractor, async (request, response, next) => {

    const user = request.user;
    if (!user) {
        return response.status(401).json({ error: 'User missing or invalid' });
    }

    const id = request.params.id;
    const { title, author, url, likes } = request.body;

    try {

        const blog = await Blog.findById(id);

        if (!blog) {
            return response.status(404).json({ error: 'Blog not found' });
        } 

        // Check if the user making the request is the owner of the blog
        if (blog.user.toString() !== user.id.toString()) {
            return response.status(403).json({ error: 'Permission denied' });
        }


        // The `new` option returns the updated document instead of the original one
        const updatedBlog = await Blog.findByIdAndUpdate(
            id,
            { title, author, url, likes },
            { new: true, runValidators: true, context: 'query' }
        );

        if (updatedBlog) {
            response.json(updatedBlog); // Return the updated blog
        } else {
            response.status(404).json({ error: 'Blog not found' }); // If blog doesn't exist
        }
    } catch (error) {
        next(error);
    }
});

module.exports = blogRouters;