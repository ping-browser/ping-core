/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import getCustomNotesHandlerInstance from './api/brave_custom_notes_handler';

const NotesContainer = styled.div`
     display: flex;
     flex-direction: column;
     align-items: center;
     padding: 20px;
     max-width: 600px;
     margin: 0 auto;
     background-color: #f0f4f8;
     border-radius: 8px;
     box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
 `;

const Title = styled.h1`
     font-size: 24px;
     color: #333;
     margin-bottom: 20px;
 `;

const NoteInput = styled.textarea`
     width: 100%;
     padding: 10px;
     font-size: 16px;
     border: 2px solid #ccc;
     border-radius: 5px;
     margin-bottom: 15px;
     resize: none;
     min-height: 80px;
 `;

const Button = styled.button`
     background-color: #007bff;
     color: white;
     border: none;
     padding: 10px 20px;
     font-size: 16px;
     border-radius: 5px;
     cursor: pointer;
     margin-right: 10px;
     &:hover {
       background-color: #0056b3;
     }
 `;

const NotesList = styled.ul`
     list-style-type: none;
     padding: 0;
     margin: 20px 0;
     width: 100%;
 `;

const NoteItem = styled.li`
     background-color: #fff;
     padding: 10px;
     border-radius: 5px;
     margin-bottom: 10px;
     box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
 `;

interface Note {
    id: number;
    title: string;
    content: string;
    summary?: string;
    timestamp: number;
}

const Notes: React.FC = () => {
    const [note, setNote] = useState('');
    const [notesList, setNotesList] = useState<Note[]>([]);
    const [editingNote, setEditingNote] = useState<Note | null>(null);

    // Fetch mojom instance
    const customNotesAPI = getCustomNotesHandlerInstance();

    // Load existing notes on component mount (from backend)
    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = () => {
        customNotesAPI.pageHandler.getAllNotes().then((response: { notes: Note[] }) => {
            setNotesList(response.notes || []);
        });
    };

    const handleAddNote = () => {
        if (note.trim()) {
            customNotesAPI.pageHandler.addNote(note).then(() => {
                loadNotes();
                setNote('');
            });
        }
    };

    const handleEditNote = (noteToEdit: Note) => {
        setEditingNote(noteToEdit);
        setNote(noteToEdit.content);
    };

    const handleUpdateNote = () => {
        if (editingNote && note.trim()) {
            customNotesAPI.pageHandler.editNote(editingNote.id, editingNote.title, note).then(() => {
                loadNotes();
                setNote('');
                setEditingNote(null);
            });
        }
    };

    const handleDeleteNote = (noteId: number) => {
        customNotesAPI.pageHandler.deleteNote(noteId).then(() => {
            loadNotes();
        });
    };

    // Summarize the selected note
    const handleSummarizeNote = (noteId: number) => {
        customNotesAPI.pageHandler.summarizeNoteContent(noteId)
            .then((response: { success: boolean, summary: string }) => {
                if (response.success) {
                    setNotesList(prevNotes =>
                        prevNotes.map(note =>
                            note.id === noteId ? { ...note, summary: response.summary } : note
                        )
                    );
                }
            })
            .catch((err: Error) => {
                console.error(err);
            });
    };

    // Rephrase the currently typed note
    const handleRephraseNote = () => {
        customNotesAPI.pageHandler.rephraseNoteContent(note)
            .then((response: { success: boolean, rephrased_content: string }) => {
                if (response.success) {
                    setNote(response.rephrased_content);  // Replace the note content with the rephrased version
                }
            })
            .catch((err: Error) => {
                console.error(err);
            });
    };

    return (
        <NotesContainer>
            <Title>My Notes</Title>
            <NoteInput
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={editingNote ? "Edit note..." : "Write a new note..."}
            />
            <Button onClick={editingNote ? handleUpdateNote : handleAddNote}>
                {editingNote ? "Update Note" : "Add Note"}
            </Button>
            {editingNote && (
                <Button onClick={() => setEditingNote(null)}>Cancel</Button>
            )}
            <Button onClick={handleRephraseNote}>Rephrase Note</Button>
            {notesList.length === 0 ? (
                <p>No notes added yet!</p>
            ) : (
                <NotesList>
                    {notesList.map((note) => (
                        <NoteItem key={note.id}>
                            <h3>{note.title}</h3>
                            <p>{note.content}</p>
                            <small>{new Date(note.timestamp).toLocaleString()}</small>
                            {note.summary && (
                                <>
                                    <h4>Summary:</h4>
                                    <p>{note.summary}</p>
                                </>
                            )}
                            <div>
                                <Button onClick={() => handleEditNote(note)}>Edit</Button>
                                <Button onClick={() => handleSummarizeNote(note.id)}>Summarize</Button>
                                <Button onClick={() => handleDeleteNote(note.id)}>Delete</Button>
                            </div>
                        </NoteItem>
                    ))}
                </NotesList>
            )}
        </NotesContainer>
    );
};

export default Notes;
