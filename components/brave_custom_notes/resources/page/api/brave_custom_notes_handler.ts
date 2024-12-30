/* Copyright (c) 2022 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
// @ts-nocheck
 import * as BraveCustomNotes from 'gen/brave/components/brave_custom_notes/common/brave_custom_notes.mojom.m.js'

 // Provide access to all the generated types
 export * from 'gen/brave/components/brave_custom_notes/common/brave_custom_notes.mojom.m.js'
 
 interface API {
   pageHandler: BraveCustomNotes.PageHandlerRemote
   callbackRouter: BraveCustomNotes.CustomNotesPageCallbackRouter
 }
 
 let apiInstance: API
 
 class CustomNotesAPI implements API {
   pageHandler: BraveCustomNotes.PageHandlerRemote
   callbackRouter: BraveCustomNotes.CustomNotesPageCallbackRouter
 
   constructor () {
     // Initialize page handler to communicate with backend
     this.pageHandler = BraveCustomNotes.NotesPageHandler.getRemote()
     // Initialize callback router to handle responses from backend
     this.callbackRouter = new BraveCustomNotes.CustomNotesPageCallbackRouter()
     // Set the callback router in the page handler to link it with the frontend
     this.pageHandler.setClientPage(this.callbackRouter.$.bindNewPipeAndPassRemote())
   }
 }
 
 export default function getCustomNotesHandlerInstance () {
   if (!apiInstance) {
     apiInstance = new CustomNotesAPI()
   }
   return apiInstance
 }
 