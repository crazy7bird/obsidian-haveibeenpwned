# Obsidian haveibeenpwned plugin

## Goal 
A plugin that check an email list on haveibeenpwned.  
It’s a small tool for personal uses,  
as i uses 1 mail per website/services/ect…

## Build 
`npm run build`  
Note, add list of requirements.

## Use 
On regular md page, use codeblock `hibp`.
The plugin render 2 buttons :
  - ⟳ for fetch haveibeenpwned.com.
  - + for add a new email.

Each email input have 3 settable :
 - Email (the one checked @ haveibeenpwned)
 - Name, the name displayed on the list.
 - Note, a note about the email...
 
 Email list is displayed by name and number of breachs/leaks.
 Then by clicking on it, it’s display email, notes, and detailled breachs informations.
 Inside each entries there are 2 buttons :
  - ✎ for eddit email, name and note.
  - 🗑 for delete this entry.