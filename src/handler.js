const { nanoid } = require("nanoid");
const bookshelf = require("./bookshelf");

// add book
const addbookHandler = (request, h)=> {
    /* data input id, name, year, author, summary, publisher, pageCount,
    readPage, finished, reading, insertedAt, updatedAt */
    const {name, year, author, summary, publisher, pageCount, readPage, reading} = request.payload;

    if(!name || name==='') {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. Mohon isi nama buku',
        });
        response.code(400);
        return response;
    }

    if (typeof pageCount !== 'number' || typeof readPage !== 'number') {
        const response = h.response({
            status: 'fail',
            message:
                'Gagal menambahkan buku. pageCount atau readPage harus Berupa Number',
        });
        response.code(400);
        return response;
    }

    if(pageCount < readPage) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
        })
        response.code(400);
        return response;
    }

    const id = nanoid(16);
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;
    const newBook = {
        id,
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished: pageCount === readPage,
        reading,
        insertedAt,
        updatedAt,
    };
    bookshelf.push(newBook);


    const isSuccess = bookshelf.filter((book) => book.id===id).length > 0;
    if(isSuccess) {
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil ditambahkan',
            data: {
                bookId: id,
            }
        });
        response.code(201);
        return response;
    }

    const response = h.response({
        status: 'fail',
        message: 'Buku gagal ditambahkan',
    });
    response.code(500);
    return response;
};

// get all book
const getAllBooksHandler = (request, h) => {
    const { name, reading, finished } = request.query;

    if (name) {
        const allBooks = bookshelf.filter((book) => book.name.toLowerCase().includes(name.toLowerCase())).map((book) => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
        }));
        
        const response = h.response({
            status: 'success',
            data: {
                books: allBooks,
            },
        });
        response.code(200);
        return response;
    }

    if (reading) {
        let allBooks;

        if (reading === '0') {
            allBooks = bookshelf.filter((book) => book.reading === false).map((book) => ({
                id: book.id,
                name: book.name,
                publisher: book.publisher,
            }));
        } else {
            allBooks = bookshelf.filter((book) => book.reading === true).map((book) => ({
                id: book.id,
                name: book.name,
                publisher: book.publisher,
            }));
        }

        const response = h.response({
            status: 'success',
            data: {
                books: allBooks,
            },
        });
        response.code(200);
        return response;
    }

    const allBooks = bookshelf.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
    }));

    const response = {
        status: 'success',
        data: {
            books: allBooks,
        },
    };

    if (finished) {
        let allBooks;

        if (finished === '1') {
            allBooks = bookshelf.filter((book) => book.finished === true).map((book) => ({
                id: book.id,
                name: book.name,
                publisher: book.publisher,
            }));
        } else {
            allBooks = bookshelf.filter((book) => book.finished === false).map((book) => ({
                id: book.id,
                name: book.name,
                publisher: book.publisher,
            }));
        }

        const response = h.response({
            status: 'success',
            data: {
                books: allBooks,
            },
        });
        response.code(200);
        return response;
    }

    return response;
};

//get book id
const getBookByIdHandler = (request, h) => {
    const {bookId} = request.params;

    const book = bookshelf.filter((n) => n.id === bookId)[0];

    if (book !== undefined) {
        return{
            status: 'success',
            data: {
                book,
            },
        };
    }

    const response = h.response({
        status: 'fail',
        message: 'Buku tidak ditemukan',
    });
    response.code(404);
    return response;
};

// edit book / update book
const editBookByIdHandler = (request, h) => {
    const { bookId } = request.params;

    const {name, year, author, summary, publisher, pageCount, readPage, reading} = request.payload;

    if (!name || name==='') {
        const response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Mohon isi nama buku',
        });
        response.code(400);
        return response;
    }

    if (typeof pageCount !== 'number' || typeof readPage !== 'number') {
        const response = h.response({
            status: 'fail',
            message:
                'Gagal memperbarui buku. pageCount atau readPage harus Berupa Number',
        });
        response.code(400);
        return response;
    }

    if (pageCount < readPage) {
        const response = h.response({
            status: 'fail',
            message:
                'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
        });
        response.code(400);
        return response;
    }

    const updatedAt = new Date().toISOString();

    const index = bookshelf.findIndex((book) => book.id === bookId);

    if (index !== -1) {
        bookshelf[index] = {
            ...bookshelf[index],
            name,
            year,
            author,
            summary,
            publisher,
            pageCount,
            readPage,
            reading,
            updatedAt,
        };

        const response = h.response({
            status: 'success',
            message: 'Buku berhasil diperbarui',
        });

        response.code(200);
        return response;
    }

    const response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Id tidak ditemukan',
    });
    response.code(404);
    return response;
};

// delete book
const deleteBookByIdHandler = (request, h) => {
    const { bookId } = request.params;

    const index = bookshelf.findIndex((book) => book.id === bookId);

    if (index !== -1) {
        bookshelf.splice(index, 1);
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil dihapus',
        });
        response.code(200);
        return response;
    }

    const response = h.response({
        status: 'fail',
        message: 'Buku gagal dihapus. Id tidak ditemukan',
    });
    response.code(404);
    return response;
};


module.exports = {addbookHandler, getAllBooksHandler, getBookByIdHandler, editBookByIdHandler, deleteBookByIdHandler};