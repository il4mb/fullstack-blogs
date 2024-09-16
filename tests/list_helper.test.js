const { describe, test, expect } = require('@jest/globals');
const listHelper = require('../utils/list_helper');

test('dummy returns one', () => {
    const blogs = []

    const result = listHelper.dummy(blogs)
    expect(result).toBe(1)
})

describe('total likes', () => {

    test('of empty list is zero', () => {
        expect(listHelper.totalLikes([])).toBe(0);
    })

    test('when list has only one blog equals the likes of that', () => {
        const listWithOneBlog = [
            {
                _id: '5a422aa71b54a676234d17f8',
                title: 'Go To Statement Considered Harmful',
                author: 'Edsger W. Dijkstra',
                url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
                likes: 5,
                __v: 0
            }
        ];
        expect(listHelper.totalLikes(listWithOneBlog)).toBe(5);
    })



    test('of a bigger list is calculated right', () => {
        const listWithMultipleBlogs = [
            {
                _id: '5a422aa71b54a676234d17f8',
                title: 'Go To Statement Considered Harmful',
                author: 'Edsger W. Dijkstra',
                url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
                likes: 5,
                __v: 0
            },
            {
                _id: '5a422aa71b54a676234d17f9',
                title: 'Second Blog',
                author: 'Author Name',
                url: 'https://example.com',
                likes: 10,
                __v: 0
            },
        ];
        expect(listHelper.totalLikes(listWithMultipleBlogs)).toBe(15);

    })
});

describe('favorite blog', () => {
    test('when list has only one blog, returns that blog', () => {
        const singleBlog = [
            {
                title: "Single Blog",
                author: "Author A",
                likes: 5
            }
        ];

        const result = listHelper.favoriteBlog(singleBlog);
        expect(result).toEqual(singleBlog[0]);
    });

    test('when list has multiple blogs, returns the blog with the most likes', () => {
        const blogs = [
            {
                title: "Blog A",
                author: "Author A",
                likes: 7
            },
            {
                title: "Blog B",
                author: "Author B",
                likes: 10
            },
            {
                title: "Blog C",
                author: "Author C",
                likes: 8
            }
        ];

        const result = listHelper.favoriteBlog(blogs);
        expect(result).toEqual(blogs[1]); // Assuming the second blog has the most likes
    });

    test('when list has multiple blogs with the same most likes, returns one of them', () => {
        const blogs = [
            {
                title: "Blog A",
                author: "Author A",
                likes: 10
            },
            {
                title: "Blog B",
                author: "Author B",
                likes: 10
            }
        ];

        const result = listHelper.favoriteBlog(blogs);
        expect([blogs[0], blogs[1]]).toContainEqual(result); // The result should be either of the blogs with 10 likes
    });

    test('when list is empty, returns null', () => {
        const result = listHelper.favoriteBlog([]);
        expect(result).toBeNull();
    });
});

describe('most blogs', () => {
    test('when list has multiple blogs, returns the author with the most blogs', () => {
        const blogs = [
            {
                title: "Blog A",
                author: "Author A",
                likes: 5
            },
            {
                title: "Blog B",
                author: "Author B",
                likes: 7
            },
            {
                title: "Blog C",
                author: "Author A",
                likes: 10
            },
            {
                title: "Blog D",
                author: "Author A",
                likes: 12
            }
        ];

        const result = listHelper.mostBlogs(blogs);
        expect(result).toEqual({
            author: "Author A",
            blogs: 3
        }); // Author A has the most blogs
    });

    test('when list has multiple top authors, returns one of them', () => {
        const blogs = [
            {
                title: "Blog A",
                author: "Author A",
                likes: 5
            },
            {
                title: "Blog B",
                author: "Author B",
                likes: 7
            },
            {
                title: "Blog C",
                author: "Author A",
                likes: 10
            },
            {
                title: "Blog D",
                author: "Author B",
                likes: 12
            }
        ];

        const result = listHelper.mostBlogs(blogs);
        expect([{
            author: "Author A",
            blogs: 2
        }, {
            author: "Author B",
            blogs: 2
        }]).toContainEqual(result); // Both authors have the same number of blogs
    });

    test('when list is empty, returns null', () => {
        const result = listHelper.mostBlogs([]);
        expect(result).toBeNull();
    });
});

describe('most likes', () => {
    test('when list has multiple blogs, returns the author with the most total likes', () => {
        const blogs = [
            {
                title: "Blog A",
                author: "Author A",
                likes: 5
            },
            {
                title: "Blog B",
                author: "Author B",
                likes: 7
            },
            {
                title: "Blog C",
                author: "Author A",
                likes: 10
            },
            {
                title: "Blog D",
                author: "Author A",
                likes: 12
            }
        ];

        const result = listHelper.mostLikes(blogs);
        expect(result).toEqual({
            author: "Author A",
            likes: 27
        }); // Author A has the most total likes
    });

    test('when list has multiple top authors, returns one of them', () => {
        const blogs = [
            {
                title: "Blog A",
                author: "Author A",
                likes: 10
            },
            {
                title: "Blog B",
                author: "Author B",
                likes: 7
            },
            {
                title: "Blog C",
                author: "Author A",
                likes: 10
            },
            {
                title: "Blog D",
                author: "Author B",
                likes: 10
            }
        ];

        const result = listHelper.mostLikes(blogs);
        expect([{
            author: "Author A",
            likes: 20
        }, {
            author: "Author B",
            likes: 17
        }]).toContainEqual(result); // Both authors have the same number of likes
    });

    test('when list is empty, returns null', () => {
        const result = listHelper.mostLikes([]);
        expect(result).toBeNull();
    });
});