const supertest = require('supertest');
const { describe, test, expect, beforeEach, afterAll, beforeAll } = require('@jest/globals');
const mongoose = require('mongoose');
const app = require('../app'); // Your Express app
const Blog = require('../models/blog'); // Your Blog model
const User = require('../models/user');

const api = supertest(app);

const user = {
    username: "test",
    name: "test user",
    password: "1234@test"
}
const dummyUser = {
    username: "dummy",
    name: "dummy user",
    password: "1234@dummy"
}
let token, dummyToken;
let userId;


const initialBlogs = [
    {
        title: 'First blog',
        author: 'Author One',
        url: 'http://example.com/1',
        likes: 5,
    },
    {
        title: 'Second blog',
        author: 'Author Two',
        url: 'http://example.com/2',
        likes: 10,
    },
];


beforeAll(async () => {

    await User.deleteMany({});

    await api.post("/api/users")
        .send(dummyUser)
        .expect(201)
        .expect('Content-Type', /application\/json/);


    const response = await api.post("/api/login")
        .send({ username, password } = dummyUser)
        .expect(200)
        .expect('Content-Type', /application\/json/);

    dummyToken = response.body.token;
});

beforeEach(async () => {
    await Blog.deleteMany({});
    await Blog.insertMany(initialBlogs);
});

describe('user API', () => {

    test('user creation test', async () => {
        const response = await api.post("/api/users")
            .send(user)
            .expect(201)
            .expect('Content-Type', /application\/json/);

        const createdUser = response.body;

        expect(createdUser.id).toBeDefined();
        expect(createdUser.username).toBe(user.username);
        expect(createdUser.name).toBe(user.name);
        expect(createdUser.blogs).toEqual([]);
        expect(createdUser.passwordHash).toBeUndefined();
        userId = createdUser.id;
    });

    test('duplicate user creation test', async () => {
        await api.post("/api/users")
            .send(user)
            .expect(400)
            .expect('Content-Type', /application\/json/);
    });

    test('user login test', async () => {
        const response = await api.post("/api/login")
            .send({ username, password } = user)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const logedinUser = response.body;
        expect(logedinUser.token).toBeDefined();
        expect(logedinUser.username).toBe(user.username);
        expect(logedinUser.name).toBe(user.name);
        token = logedinUser.token;
    });
});

describe('GET /api/blogs', () => {
    test('should return the correct number of blogs in JSON format', async () => {
        const response = await api
            .get('/api/blogs')
            .expect(200) // Status code
            .expect('Content-Type', /application\/json/); // Content type
        // Check if the number of blogs returned matches the initial data
        expect(response.body.length).toBe(initialBlogs.length);
    });

    test('should return blogs with property `id` and not `_id`', async () => {
        const response = await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/);

        response.body.forEach(blog => {
            expect(blog.id).toBeDefined();
            expect(blog._id).toBeUndefined();
        });
    });
});

describe('POST /api/blogs', () => {

    test('creating a new blog test', async () => {
        const newBlog = {
            title: 'Third blog',
            author: 'Author Three',
            url: 'http://example.com/3',
            likes: 20,
        };

        const initialBlogsCount = initialBlogs.length;
        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201) // Expect the status code for successful creation
            .expect('Content-Type', /application\/json/); // Check content-type

        // Check that the number of blogs has increased by one
        const blogsAtEndResponse = await api.get('/api/blogs');
        const blogsAtEnd = blogsAtEndResponse.body;
        expect(blogsAtEnd.length).toBe(initialBlogsCount + 1);

        // Check that the new blog is correctly saved
        const savedBlog = blogsAtEnd.find(blog => blog.title === newBlog.title);
        expect(savedBlog).toBeDefined();
        expect(savedBlog.author).toBe(newBlog.author);
        expect(savedBlog.url).toBe(newBlog.url);
        expect(savedBlog.likes).toBe(newBlog.likes);
        expect(savedBlog.user).toBeDefined();
        expect(savedBlog.user.id).toBe(userId);
    });

    test('creating a new blog witout user test', async () => {
        const newBlog = {
            title: 'Third blog',
            author: 'Author Three',
            url: 'http://example.com/3',
            likes: 20,
        };

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401) // Expect the status code for successful creation
            .expect('Content-Type', /application\/json/); // Check content-type
    });

    test('should default likes to 0 if not provided', async () => {
        const newBlogWithoutLikes = {
            title: 'Blog without likes',
            author: 'Author Without Likes',
            url: 'http://example.com/without-likes',
        };

        const postResponse = await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlogWithoutLikes)
            .expect(201) // Expect status code for successful creation
            .expect('Content-Type', /application\/json/); // Check content-type

        // Check that the likes default to 0
        expect(postResponse.body.likes).toBe(0);

        // Optionally, verify other properties if needed
        expect(postResponse.body.title).toBe(newBlogWithoutLikes.title);
        expect(postResponse.body.author).toBe(newBlogWithoutLikes.author);
        expect(postResponse.body.url).toBe(newBlogWithoutLikes.url);
    });

    test('should respond with 400 if title is missing', async () => {
        const blogWithoutTitle = {
            author: 'Author Missing Title',
            url: 'http://example.com/missing-title',
            likes: 5,
        };

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(blogWithoutTitle)
            .expect(400) // Expect Bad Request
            .expect('Content-Type', /application\/json/); // Check content-type
    });

    test('should respond with 400 if url is missing', async () => {
        const blogWithoutUrl = {
            title: 'Blog Missing URL',
            author: 'Author Missing URL',
            likes: 5,
        };

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(blogWithoutUrl)
            .expect(400) // Expect Bad Request
            .expect('Content-Type', /application\/json/); // Check content-type
    });
});

describe('DELETE /api/blogs/:id', () => {
    let blogId;

    beforeEach(async () => {
        const newBlog = {
            title: 'Blog to be deleted',
            author: 'Author Delete',
            url: 'http://example.com/delete',
            likes: 3,
        };
        const response = await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201);

        blogId = response.body.id;
    });

    test('should return 401 if not authenticated', async () => {
        await api
            .delete(`/api/blogs/${blogId}`)
            .expect(401); // Unauthorized
    });


    test('should error delete another user blog', async () => {
        await api
            .delete(`/api/blogs/${blogId}`)
            .set('Authorization', `Bearer ${dummyToken}`)
            .expect(403); // forbidden
    })

    test('should delete a blog successfully', async () => {
        await api
            .delete(`/api/blogs/${blogId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204); // No Content

        // Verify that the blog is deleted
        const blogsAtEnd = await api.get('/api/blogs');
        const ids = blogsAtEnd.body.map(blog => blog.id);

        expect(ids).not.toContain(blogId);
    });

    test('should return 404 if blog does not exist', async () => {
        const nonExistentId = '605c72efc9d3d36d0a3b2f6f'; // Example non-existent ID

        await api
            .delete(`/api/blogs/${nonExistentId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(404) // Not Found
            .expect('Content-Type', /application\/json/);
    });
});


describe('PUT /api/blogs/:id', () => {
    let blogId;

    beforeEach(async () => {
        const newBlog = {
            title: 'Blog to be updated',
            author: 'Author Update',
            url: 'http://example.com/update',
            likes: 5,
        };
        const response = await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201);
        blogId = response.body.id;
    });


    test('should return 401 if not authenticated', async () => {
        await api
            .put(`/api/blogs/${blogId}`)
            .send({ title: "Updated title" })
            .expect(401); // Unauthorized
    });

    test('should error update another user blog', async () => {
        await api
            .delete(`/api/blogs/${blogId}`)
            .set('Authorization', `Bearer ${dummyToken}`)
            .send({ title: "Updated title" })
            .expect(403); // forbidden
    })

    test('should update the number of likes of a blog', async () => {
        const updatedLikes = 10;

        const response = await api
            .put(`/api/blogs/${blogId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ likes: updatedLikes })
            .expect(200) // OK
            .expect('Content-Type', /application\/json/);

        expect(response.body.likes).toBe(updatedLikes);
    });

    test('should return 404 if blog does not exist', async () => {
        const nonExistentId = '605c72efc9d3d36d0a3b2f6f'; // Example non-existent ID

        await api
            .put(`/api/blogs/${nonExistentId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ likes: 10 })
            .expect(404) // Not Found
            .expect('Content-Type', /application\/json/);
    });
});


afterAll(async () => {
    await mongoose.connection.close(); // Close the database connection after tests
});
