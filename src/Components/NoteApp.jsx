import React, { useReducer, useEffect, useState } from 'react';
import { Plus, FilePlus2, SquarePen, Trash } from "lucide-react";
import Editor from 'react-simple-wysiwyg';

const initialState = JSON.parse(localStorage.getItem('notes')) || [];

function reducer(state, action) {
    switch (action.type) {
        case 'ADD':
            return [...state, action.payload];
        case 'DELETE':
            return state.filter(note => note.id !== action.id);
        case 'EDIT':
            return state.map(note => note.id === action.payload.id ? action.payload : note);
        default:
            return state;
    }
}

const categories = ['Personal', 'Work', 'Ideas', 'Other'];
const cardColors = ['#FFD0EE', '#FFEBCD', '#D8F3CC', '#E0E7FF'];

const NoteApp = () => {
    const [notes, dispatch] = useReducer(reducer, initialState);
    const [showForm, setShowForm] = useState(false);
    const [editNote, setEditNote] = useState(null);
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('');
    const [form, setForm] = useState({ title: '', content: '', category: categories[0] });
    const [openNote, setOpenNote] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = React.useRef(null);
    useEffect(() => {
        localStorage.setItem('notes', JSON.stringify(notes));
    }, [notes]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        if (editNote) {
            dispatch({ type: 'EDIT', payload: { ...form, id: editNote.id, color: editNote.color } });
        } else {
            const randomColor = cardColors[Math.floor(Math.random() * cardColors.length)];
            dispatch({ type: 'ADD', payload: { ...form, id: Date.now(), color: randomColor } });
        }
        setForm({ title: '', content: '', category: categories[0] });
        setShowForm(false);
        setEditNote(null);
    };

    const handleEdit = (note) => {
        setEditNote(note);
        setForm(note);
        setShowForm(true);
    };

    const filteredNotes = notes.filter(note =>
        (note.title.toLowerCase().includes(search.toLowerCase()) ||
            note.content.toLowerCase().includes(search.toLowerCase())) &&
        (filterCat ? note.category === filterCat : true)
    );

    return (
        <div className="m-5">

            <div className="flex gap-4 mb-4 items-center">
                <input
                    className="bg-gray-100 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all w-full max-w-sm"
                    placeholder="Search notes..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />

                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        className="bg-gray-100 px-3 py-2 rounded-lg flex items-center gap-2 min-w-[160px] shadow-sm hover:bg-gray-200 transition-all"
                        onClick={() => setShowDropdown(v => !v)}
                    >
                        {filterCat ? filterCat : "All Categories"}
                        <span className="ml-2">&#9662;</span>
                    </button>

                    {showDropdown && (
                        <div className="absolute left-0 mt-2 w-full bg-white rounded-lg shadow-lg z-10 overflow-hidden">
                            <div
                                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 transition-all ${filterCat === '' ? 'font-semibold' : ''}`}
                                onClick={() => { setFilterCat(''); setShowDropdown(false); }}
                            >
                                All Categories
                            </div>
                            {categories.map(cat => (
                                <div
                                    key={cat}
                                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 transition-all ${filterCat === cat ? 'font-semibold' : ''}`}
                                    onClick={() => { setFilterCat(cat); setShowDropdown(false); }}
                                >
                                    {cat}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>


            {/* Notes Grid */}
            <div className="grid grid-cols-4 gap-6">
                {/* Add Note Button */}
                <div className="bg-[#EEF7D0] rounded-3xl h-56 p-4 flex items-center justify-center ">
                    <button
                        className="bg-[#84a712b6] text-white   text-3xl px-6 py-6 rounded-full"
                        onClick={() => { setShowForm(true); setEditNote(null); setForm({ title: '', content: '', category: categories[0] }); }}
                    >
                        <Plus />
                    </button>
                </div>
                {/* Notes */}
                {filteredNotes.map(note => (
                    <div
                        key={note.id}
                        className="rounded-3xl h-56 p-4 group relative cursor-pointer"
                        style={{ background: note.color || cardColors[0] }}
                        onClick={() => setOpenNote(note)}
                    >
                        <div
                            className="absolute top-4 right-4 gap-2 flex opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={e => e.stopPropagation()}
                        >
                            <button onClick={() => handleEdit(note)}><SquarePen size={20} /></button>
                            <button onClick={() => dispatch({ type: 'DELETE', id: note.id })}><Trash size={20} /></button>
                        </div>
                        <h3 className="text-lg overflow-x-hidden truncate mt-1">{note.title}</h3>
                        <div className="overflow-y-hidden  text-sm text-gray-600 line-clamp-8" dangerouslySetInnerHTML={{ __html: note.content }} />
                        <span className="absolute bottom-2 right-4 text-xs bg-white/70 px-2 rounded">{note.category}</span>
                    </div>
                ))}
            </div>

            {/* Add/Edit Note Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 ">
                    <form
                        className="bg-white rounded-2xl p-4   shadow-2xl flex flex-col gap-2 transition-all"
                        onSubmit={handleSubmit}
                    >
                        <h2 className="text-2xl font-semibold text-gray-800 mb-1">
                            {editNote ? 'Edit Note' : 'Add Note'}
                        </h2>

                        <input
                            className="bg-gray-100 px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                            placeholder="Title"
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            required
                        />

                        <select
                            className="bg-gray-100 px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                            value={form.category}
                            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        <div className="bg-gray-100 rounded-lg px-2 py-1">
                            <Editor
                                value={form.content}
                                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                                placeholder="Write your note..."
                            />
                        </div>

                        <div className="flex justify-end gap-2 mt-2">
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg transition-all"
                            >
                                {editNote ? 'Update' : 'Add'}
                            </button>
                            <button
                                type="button"
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-lg transition-all"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditNote(null);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* View Note Modal */}
            {openNote && (
                <div
                    className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
                    onClick={() => setOpenNote(null)}
                >
                    <div
                        className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl relative transition-all"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-3 right-4 text-gray-500 text-2xl hover:text-gray-800 transition"
                            onClick={() => setOpenNote(null)}
                        >
                            &times;
                        </button>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-1">{openNote.title}</h2>
                        <div className="text-sm text-gray-400 mb-4">{openNote.category}</div>
                        <div
                            className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: openNote.content }}
                        />
                    </div>
                </div>
            )}

        </div>
    );
};

export default NoteApp;