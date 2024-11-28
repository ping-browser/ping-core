/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import getCustomNotesHandlerInstance from './api/brave_custom_notes_handler';

// Styled Components
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

// Note interface
interface Note {
    id: number;
    title: string;
    content: string;
    summary?: string;
    timestamp: number;
}

const AZURE_OPENAI_API_ENDPOINT = 'https://ping.openai.azure.com/openai/deployments/ai-summariser-gpt-35-turbo/chat/completions?api-version=2024-02-15-preview';
const AZURE_OPENAI_API_KEY = 'b487c4dc0bc1490e801cb6220cf04039';

const Notes: React.FC = () => {
    const [note, setNote] = useState('');
    const [notesList, setNotesList] = useState<Note[]>([]);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch mojom instance
    const customNotesAPI = getCustomNotesHandlerInstance();

    // Load existing notes on component mount
    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = () => {
        customNotesAPI.pageHandler.getAllNotes()
            .then((response: { notes: Note[] }) => {
                setNotesList(response.notes || []);
            })
            .catch((err: Error) => {
                console.error(err);
                alert('Failed to load notes. Please try again.');
            });
    };

    const handleAddNote = () => {
        if (note.trim()) {
            setIsLoading(true);
            customNotesAPI.pageHandler.addNote(note)
                .then(() => {
                    loadNotes();
                    setNote('');
                })
                .catch((err: Error) => {
                    console.error(err);
                    alert('Failed to add note. Please try again.');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    };

    const handleEditNote = (noteToEdit: Note) => {
        setEditingNote(noteToEdit);
        setNote(noteToEdit.content);
    };

    const handleUpdateNote = () => {
        if (editingNote && note.trim()) {
            setIsLoading(true);
            customNotesAPI.pageHandler.editNote(editingNote.id, editingNote.title, note)
                .then(() => {
                    loadNotes();
                    setNote('');
                    setEditingNote(null);
                })
                .catch((err: Error) => {
                    console.error(err);
                    alert('Failed to update note. Please try again.');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    };

    const handleDeleteNote = (noteId: number) => {
        setIsLoading(true);
        customNotesAPI.pageHandler.deleteNote(noteId)
            .then(() => {
                loadNotes();
            })
            .catch((err: Error) => {
                console.error(err);
                alert('Failed to delete note. Please try again.');
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    // Summarize the selected note
    const handleSummarizeNote = (noteId: number) => {
        setIsLoading(true);
        customNotesAPI.pageHandler.summarizeNoteContent(noteId)
            .then((response: { success: boolean, summary: string }) => {
                if (response.success) {
                    setNotesList(prevNotes =>
                        prevNotes.map(note =>
                            note.id === noteId
                                ? {
                                    ...note,
                                    summary: response.summary, // Store summary in note object
                                    content: note.content // Preserve original content
                                }
                                : note
                        )
                    );
                } else {
                    alert('Failed to summarize note. Please try again.');
                }
            })
            .catch((err: Error) => {
                console.error(err);
                alert('Failed to summarize note. Please try again.');
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleRephraseNote = async () => {
        if (!note.trim()) {
            alert('Please enter some text to rephrase.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(
                AZURE_OPENAI_API_ENDPOINT,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': AZURE_OPENAI_API_KEY
                    },
                    body: JSON.stringify({
                        messages: [
                            {
                                role: 'system',
                                content: 'You are a helpful assistant that rephrases text while maintaining its original meaning.'
                            },
                            {
                                role: 'user',
                                content: `Rephrase the following text: ${note}`
                            }
                        ],
                        max_tokens: 500,
                        temperature: 0.7,
                        top_p: 0.95,
                        frequency_penalty: 0,
                        presence_penalty: 0,
                        stream: false
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const rephrasedContent = data.choices[0].message.content.trim();
            if (editingNote) {
                setNotesList(prevNotes =>
                    prevNotes.map(note =>
                        note.id === editingNote.id
                            ? {
                                ...note,
                                content: rephrasedContent
                            }
                            : note
                    )
                );
            }
            setNote(rephrasedContent);
        } catch (error) {
            console.error('Rephrasing failed:', error);
            alert('Failed to rephrase note. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <NotesContainer>
            <Title>My Notes</Title>
            <NoteInput
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={editingNote ? "Edit note..." : "Write a new note..."}
            />
            <div>
                <Button
                    onClick={editingNote ? handleUpdateNote : handleAddNote}
                    disabled={isLoading}
                >
                    {isLoading ? "Loading..." : (editingNote ? "Update Note" : "Add Note")}
                </Button>
                {editingNote && (
                    <Button onClick={() => setEditingNote(null)}>Cancel</Button>
                )}
                <Button
                    onClick={handleRephraseNote}
                    disabled={isLoading || !note.trim()}
                >
                    Rephrase Note
                </Button>
            </div>

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
                                <div className="summary-section">
                                    <h4>Summary:</h4>
                                    <p>{note.summary}</p>
                                </div>
                            )}
                            <div className="note-actions">
                                <Button
                                    onClick={() => handleEditNote(note)}
                                    disabled={isLoading}
                                >
                                    Edit
                                </Button>
                                <Button
                                    onClick={() => handleSummarizeNote(note.id)}
                                    disabled={isLoading}
                                >
                                    Summarize
                                </Button>
                                <Button
                                    onClick={() => handleDeleteNote(note.id)}
                                    disabled={isLoading}
                                >
                                    Delete
                                </Button>
                            </div>
                        </NoteItem>
                    ))}
                </NotesList>
            )}
        </NotesContainer>
    );
};

export default Notes;