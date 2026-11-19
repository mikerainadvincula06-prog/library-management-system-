
import { useEffect, useState } from "react";
import {
  Routes, Route, Link, Navigate, useNavigate
} from "react-router-dom";

import { useStore } from "./store";

import {
  getBooks, addBook, updateBook, deleteBook,
  getStudents, addStudent,
  getTransactions, addTransaction, updateTransaction
} from "./api";

function Login() {
  const login = useStore((s) => s.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(e) {
    e.preventDefault();

    if (email === "admin" && password === "1234") {
      login({ role: "Librarian", name: "Librarian" });
      navigate("/dashboard");
    } else if (email === "student" && password === "1234") {
      login({
        role: "Student",
        name: "Juan Dela Cruz",
        code: "S001"
      });
      navigate("/dashboard");
    } else {
      setError("Incorrect username or password.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">

        <h1 className="text-2xl font-bold text-blue-900 text-center">
          📚 Library Management
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Login to your account
        </p>

        <label>Username</label>
        <input className="w-full border p-3 rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required />

        <label>Password</label>
        <input type="password"
          className="w-full border p-3 rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required />

        {error && <p className="text-red-600 mb-3">{error}</p>}

        <button className="bg-blue-800 text-white p-3 rounded w-full">
          Login
        </button>

        <div className="bg-blue-50 p-3 rounded mt-5 text-sm">
          <b>Demo Accounts</b>
          <p>Librarian: admin / 1234</p>
          <p>Student: student / 1234</p>
        </div>
      </form>
    </div>
  );
}

function Protected({ children, role }) {
  const user = useStore((s) => s.user);

  if (!user) return <Navigate to="/" />;

  if (role && user.role !== role) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

function Layout({ children }) {
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);
  const navigate = useNavigate();

  function exit() {
    logout();
    navigate("/");
  }

  const links = user.role === "Librarian"
    ? [
        ["Dashboard", "/dashboard"],
        ["Manage Books", "/books"],
        ["Search Books", "/search"],
        ["Borrow Requests", "/requests"],
        ["Return Books", "/returns"],
        ["Students", "/students"],
        ["Records", "/records"]
      ]
    : [
        ["Dashboard", "/dashboard"],
        ["Search Books", "/search"],
        ["Borrow Books", "/borrow"],
        ["My Borrowed Books", "/mybooks"]
      ];

  return (
    <div className="min-h-screen">
      <header className="bg-blue-950 text-white p-5 flex justify-between items-center">
        <div>
          <h1 className="font-bold text-xl">📚 Library Management</h1>
          <p className="text-sm text-blue-200">
            {user.name} - {user.role}
          </p>
        </div>

        <button onClick={exit}
          className="bg-red-600 px-4 py-2 rounded">
          Logout
        </button>
      </header>

      <nav className="bg-white p-3 flex gap-2 flex-wrap shadow">
        {links.map(([name, path]) => (
          <Link key={path} to={path}
            className="bg-blue-100 text-blue-900 px-3 py-2 rounded text-sm">
            {name}
          </Link>
        ))}
      </nav>

      <main className="max-w-6xl mx-auto p-5">
        {children}
      </main>
    </div>
  );
}

function Dashboard() {
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const [b, s, t] = await Promise.all([
        getBooks(), getStudents(), getTransactions()
      ]);

      setBooks(b.data);
      setStudents(s.data);
      setTransactions(t.data);
    } catch {
      setError("Cannot load database information.");
    }
  }

  useEffect(() => { loadData(); }, []);

  const user = useStore((s) => s.user);

  const myTransactions = transactions.filter(
    (t) => t.student_code === user.code
  );

  return (
    <>
      <h2 className="text-2xl font-bold text-blue-950 mb-5">
        Dashboard
      </h2>

      {error && <p className="text-red-600">{error}</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat title="Total Books" number={books.length} />
        <Stat title="Available Books"
          number={books.filter(b => b.status === "Available").length} />
        <Stat title="Borrowed Books"
          number={books.filter(b => b.status === "Borrowed").length} />
        <Stat title="Students" number={students.length} />
      </div>

      {user.role === "Student" && (
        <div className="bg-white rounded-xl shadow p-5 mt-6">
          <h3 className="font-bold text-lg mb-3">My Requests</h3>
          {myTransactions.map(t => (
            <p key={t.id} className="border-b py-2">
              {t.book_title} - <b>{t.status}</b>
            </p>
          ))}
          {myTransactions.length === 0 && <p>No requests yet.</p>}
        </div>
      )}
    </>
  );
}

function Stat({ title, number }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-3xl font-bold text-blue-900 mt-2">
        {number}
      </h2>
    </div>
  );
}

function Books() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");

  async function loadBooks() {
    try {
      const result = await getBooks();
      setBooks(result.data);
    } catch {
      setMessage("Cannot load books.");
    }
  }

  useEffect(() => { loadBooks(); }, []);

  async function saveBook(e) {
    e.preventDefault();

    try {
      if (editId) {
        await updateBook(editId, { title, author, category });
        setMessage("Book updated successfully.");
      } else {
        await addBook({ title, author, category, status: "Available" });
        setMessage("Book added successfully.");
      }

      setTitle("");
      setAuthor("");
      setCategory("");
      setEditId(null);
      loadBooks();
    } catch {
      setMessage("Unable to save book. Check the information.");
    }
  }

  async function removeBook(id) {
    if (!window.confirm("Delete this book?")) return;

    try {
      await deleteBook(id);
      setMessage("Book deleted.");
      loadBooks();
    } catch {
      setMessage("Cannot delete this book.");
    }
  }

  function editBook(book) {
    if (book.status !== "Available") {
      setMessage("Return the book before editing.");
      return;
    }

    setEditId(book.id);
    setTitle(book.title);
    setAuthor(book.author);
    setCategory(book.category || "");
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-5">Manage Books</h2>

      <form onSubmit={saveBook}
        className="bg-white p-5 rounded-xl shadow mb-6">

        <h3 className="font-bold mb-3">
          {editId ? "Edit Book" : "Add New Book"}
        </h3>

        <input required placeholder="Book Title"
          className="border p-3 rounded w-full mb-3"
          value={title} onChange={e => setTitle(e.target.value)} />

        <input required placeholder="Author"
          className="border p-3 rounded w-full mb-3"
          value={author} onChange={e => setAuthor(e.target.value)} />

        <input placeholder="Category"
          className="border p-3 rounded w-full mb-3"
          value={category} onChange={e => setCategory(e.target.value)} />

        <button className="bg-blue-800 text-white px-5 py-2 rounded">
          {editId ? "Save Changes" : "Add Book"}
        </button>

        <button type="button"
          onClick={() => {
            setEditId(null);
            setTitle("");
            setAuthor("");
            setCategory("");
          }}
          className="bg-gray-300 px-5 py-2 rounded ml-2">
          Clear
        </button>

        <p className="mt-3 text-green-700">{message}</p>
      </form>

      <BookTable books={books} librarian={true}
        onEdit={editBook} onDelete={removeBook} />
    </>
  );
}

function BookTable({ books, librarian = false, onEdit, onDelete, onBorrow }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-blue-50">
            <th className="p-3">Title</th>
            <th className="p-3">Author</th>
            <th className="p-3">Category</th>
            <th className="p-3">Status</th>
            {(librarian || onBorrow) && <th className="p-3">Action</th>}
          </tr>
        </thead>

        <tbody>
          {books.map(book => (
            <tr key={book.id} className="border-b">
              <td className="p-3">{book.title}</td>
              <td className="p-3">{book.author}</td>
              <td className="p-3">{book.category}</td>
              <td className="p-3">{book.status}</td>

              {librarian && (
                <td className="p-3">
                  <button onClick={() => onEdit(book)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2">
                    Edit
                  </button>
                  <button onClick={() => onDelete(book.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded">
                    Delete
                  </button>
                </td>
              )}

              {onBorrow && (
                <td className="p-3">
                  <button disabled={book.status !== "Available"}
                    onClick={() => onBorrow(book)}
                    className="bg-blue-700 text-white px-3 py-1 rounded disabled:bg-gray-400">
                    Request
                  </button>
                </td>
              )}
            </tr>
          ))}

          {books.length === 0 && (
            <tr><td colSpan="5" className="p-4">No books found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function SearchBooks() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const user = useStore(s => s.user);
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const result = await getBooks();
      setBooks(result.data);
    } catch {
      setMessage("Cannot load books.");
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = books.filter(book =>
    `${book.title} ${book.author} ${book.category}`
      .toLowerCase().includes(search.toLowerCase())
  );

  async function requestBook(book) {
    try {
      await addTransaction({
        student_name: user.name,
        student_code: user.code,
        book_id: book.id,
        book_title: book.title,
        status: "Requested"
      });

      setMessage("Borrow request submitted. Wait for librarian approval.");
    } catch {
      setMessage("Request failed.");
    }
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Search Books</h2>

      <input className="w-full p-3 border rounded mb-4"
        placeholder="Search title or author..."
        value={search}
        onChange={e => setSearch(e.target.value)} />

      <p className="text-green-700 mb-3">{message}</p>

      <BookTable books={filtered}
        onBorrow={user.role === "Student" ? requestBook : null} />
    </>
  );
}

function Requests() {
  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const result = await getTransactions();
      setRecords(result.data);
    } catch {
      setMessage("Cannot load requests.");
    }
  }

  useEffect(() => { load(); }, []);

  async function approve(t) {
    try {
      const result = await getBooks();
      const book = result.data.find(b => b.id === t.book_id);

      if (!book || book.status !== "Available") {
        setMessage("Book is no longer available. Request cannot be approved.");
        return;
      }

      await updateBook(book.id, { status: "Borrowed" });

      await updateTransaction(t.id, {
        status: "Borrowed",
        due_date: new Date(Date.now() + 7 * 86400000)
          .toISOString().slice(0, 10)
      });

      setMessage("Request approved successfully.");
      load();
    } catch {
      setMessage("Approval failed.");
    }
  }

  async function reject(t) {
    try {
      await updateTransaction(t.id, { status: "Rejected" });
      setMessage("Request rejected.");
      load();
    } catch {
      setMessage("Unable to reject request.");
    }
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Borrow Requests</h2>
      <p className="text-green-700 mb-3">{message}</p>

      {records.map(t => (
        <div key={t.id} className="bg-white p-4 rounded shadow mb-3">
          <b>{t.student_name}</b> - {t.book_title}
          <p className="text-gray-600">Status: {t.status}</p>

          {t.status === "Requested" && (
            <div className="flex gap-2 mt-3">
              <button onClick={() => approve(t)}
                className="bg-green-700 text-white px-4 py-2 rounded">
                Approve
              </button>
              <button onClick={() => reject(t)}
                className="bg-red-600 text-white px-4 py-2 rounded">
                Reject
              </button>
            </div>
          )}
        </div>
      ))}

      {records.length === 0 && <p>No requests found.</p>}
    </>
  );
}

function Borrow() {
  return (
    <>
      <h2 className="text-2xl font-bold mb-3">Borrow Books</h2>
      <p className="mb-4">Search for a book and click Request. The librarian must approve it.</p>
      <SearchBooks />
    </>
  );
}

function MyBooks() {
  const user = useStore(s => s.user);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    getTransactions()
      .then(r => setRecords(r.data.filter(t => t.student_code === user.code)))
      .catch(() => setRecords([]));
  }, [user.code]);

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">My Borrowed Books</h2>

      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        <table className="w-full text-left">
          <thead><tr>
            <th className="p-3">Book</th>
            <th className="p-3">Status</th>
            <th className="p-3">Due Date</th>
          </tr></thead>
          <tbody>
            {records.map(t => (
              <tr key={t.id} className="border-b">
                <td className="p-3">{t.book_title}</td>
                <td className="p-3">{t.status}</td>
                <td className="p-3">{t.due_date || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {records.length === 0 && <p>No borrowed books or requests.</p>}
      </div>
    </>
  );
}

function Returns() {
  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState("");

  async function load() {
    const result = await getTransactions();
    setRecords(result.data.filter(t => t.status === "Borrowed"));
  }

  useEffect(() => { load(); }, []);

  async function returnBook(t) {
    if (!window.confirm("Confirm book return?")) return;

    try {
      await updateBook(t.book_id, { status: "Available" });

      await updateTransaction(t.id, {
        status: "Returned",
        return_date: new Date().toISOString().slice(0, 10)
      });

      setMessage("Book returned successfully.");
      load();
    } catch {
      setMessage("Unable to record return.");
    }
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Return Books</h2>
      <p className="text-green-700">{message}</p>

      {records.map(t => (
        <div key={t.id} className="bg-white p-4 shadow rounded mb-3">
          <b>{t.book_title}</b>
          <p>Student: {t.student_name}</p>
          <p>Due date: {t.due_date || "-"}</p>
          <button onClick={() => returnBook(t)}
            className="bg-green-700 text-white px-4 py-2 rounded mt-2">
            Confirm Return
          </button>
        </div>
      ))}

      {records.length === 0 && <p>No borrowed books to return.</p>}
    </>
  );
}

function Students() {
  const [students, setStudents] = useState([]);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const result = await getStudents();
      setStudents(result.data);
    } catch {
      setMessage("Cannot load students.");
    }
  }

  useEffect(() => { load(); }, []);

  async function saveStudent(e) {
    e.preventDefault();

    try {
      await addStudent({
        student_code: code,
        name,
        course
      });

      setCode("");
      setName("");
      setCourse("");
      setMessage("Student added successfully.");
      load();
    } catch {
      setMessage("Unable to add student. Check the Student ID.");
    }
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Manage Students</h2>

      <form onSubmit={saveStudent}
        className="bg-white p-5 rounded shadow mb-5">

        <input required placeholder="Student ID"
          className="border p-3 w-full rounded mb-3"
          value={code} onChange={e => setCode(e.target.value)} />

        <input required placeholder="Student Name"
          className="border p-3 w-full rounded mb-3"
          value={name} onChange={e => setName(e.target.value)} />

        <input placeholder="Course / Section"
          className="border p-3 w-full rounded mb-3"
          value={course} onChange={e => setCourse(e.target.value)} />

        <button className="bg-blue-800 text-white px-5 py-2 rounded">
          Add Student
        </button>

        <p className="text-green-700 mt-3">{message}</p>
      </form>

      <div className="bg-white p-5 rounded shadow">
        {students.map(s => (
          <p key={s.id} className="border-b py-2">
            {s.student_code} - {s.name} - {s.course}
          </p>
        ))}
      </div>
    </>
  );
}

function Records() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    getTransactions()
      .then(r => setRecords(r.data))
      .catch(() => setRecords([]));
  }, []);

  function downloadReport() {
    const rows = [
      ["Student", "Book", "Status", "Borrow Date", "Due Date"],
      ...records.map(t => [
        t.student_name, t.book_title, t.status,
        t.request_date, t.due_date || ""
      ])
    ];

    const csv = rows.map(row =>
      row.map(value => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")
    ).join("\n");

    const file = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = "library-records.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Transaction Records</h2>

      <button onClick={downloadReport}
        className="bg-blue-800 text-white px-4 py-2 rounded mb-4">
        Download Report
      </button>

      <