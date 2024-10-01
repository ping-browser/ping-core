/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
import * as React from 'react';
import { useState } from 'react';
import styled from 'styled-components';

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

const AddButton = styled.button`
   background-color: #007bff;
   color: white;
   border: none;
   padding: 10px 20px;
   font-size: 16px;
   border-radius: 5px;
   cursor: pointer;
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

const NoNotesMessage = styled.p`
   font-size: 16px;
   color: #999;
 `;

const Notes: React.FC = () => {
    const [note, setNote] = useState('');
    const [notesList, setNotesList] = useState<string[]>([]);

    const handleAddNote = () => {
        if (note.trim()) {
            setNotesList([...notesList, note]);
            setNote('');
        }
    };

    return (
        <NotesContainer>
            <Title>My Notes</Title>
            <NoteInput
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write a new note..."
            />
            <AddButton onClick={handleAddNote}>Add Note</AddButton>

            {notesList.length === 0 ? (
                <NoNotesMessage>No notes added yet!</NoNotesMessage>
            ) : (
                <NotesList>
                    {notesList.map((note, index) => (
                        <NoteItem key={index}>{note}</NoteItem>
                    ))}
                </NotesList>
            )}
        </NotesContainer>
    );
};

export default Notes;
