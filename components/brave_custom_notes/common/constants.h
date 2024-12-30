/* Copyright (c) 2022 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_COMPONENTS_BRAVE_CUSTOM_NOTES_H_
#define BRAVE_COMPONENTS_BRAVE_CUSTOM_NOTES_H_

#include "components/grit/brave_components_strings.h"
#include "ui/base/webui/web_ui_util.h"

namespace brave_custom_notes {

inline constexpr webui::LocalizedString kLocalizedStrings[] = {
    {"notesHeaderTitle", IDS_BRAVE_CUSTOM_NOTES_HEADER_TITLE},
    {"notesHeaderDesc", IDS_BRAVE_CUSTOM_NOTES_HEADER_DESCRIPTION},
    {"createNoteButton", IDS_BRAVE_CUSTOM_NOTES_CREATE_NOTE_BUTTON},
    {"editNoteButton", IDS_BRAVE_CUSTOM_NOTES_EDIT_NOTE_BUTTON},
    {"deleteNoteButton", IDS_BRAVE_CUSTOM_NOTES_DELETE_NOTE_BUTTON},
    {"notePlaceholderTitle", IDS_BRAVE_CUSTOM_NOTES_PLACEHOLDER_TITLE},
    {"notePlaceholderContent", IDS_BRAVE_CUSTOM_NOTES_PLACEHOLDER_CONTENT},
    {"noteSavedMessage", IDS_BRAVE_CUSTOM_NOTES_NOTE_SAVED_MESSAGE},
    {"noteDeletedMessage", IDS_BRAVE_CUSTOM_NOTES_NOTE_DELETED_MESSAGE},
    {"notesListTitle", IDS_BRAVE_CUSTOM_NOTES_LIST_TITLE},
    {"noNotesMessage", IDS_BRAVE_CUSTOM_NOTES_NO_NOTES_MESSAGE},
    {"notesSearchPlaceholder", IDS_BRAVE_CUSTOM_NOTES_SEARCH_PLACEHOLDER},
};

}  // namespace brave_custom_notes

#endif  // BRAVE_COMPONENTS_BRAVE_CUSTOM_NOTES_H_
