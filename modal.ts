import {App,Modal,Setting} from "obsidian";
import { entry } from "./entry";

export class HibpModal extends Modal{
  constructor(app: App, onSubmit:(result:{entry:entry,id:number})=>void, data?:entry, index?:number) {
    super(app);

  this.setTitle(`Edit Email informations :`);

	let email = data?.email ?? '';
    new Setting(this.contentEl)
      .setName('Email')
      .addText((text) =>{
        text
          .setValue(email)
          .onChange((value) => {
            email = value;
          });
      });

	let name = data?.name ?? '';
    new Setting(this.contentEl)
      .setName('Name')
      .addText((text) =>{
        text
          .setValue(name)
          .onChange((value) => {
            name = value;
          });
      });

    let notes =data?.notes ?? '';
    new Setting(this.contentEl)
      .setName('Notes')
      .addText((text) =>{
        text
          .setValue(notes)
          .onChange((value) => {
            notes = value;
          });
      });

    let breachs:Record<string,any> = data?.breachs ?? [];

    new Setting(this.contentEl)
      .addButton((btn) =>
        btn
          .setButtonText('Submit')
          .setCta()
          .onClick(() => {
            this.close();
            onSubmit({
              entry:{email,name,notes,breachs}, 
              id:index ?? -1
            });
          }));
  }
}


export class HibpConfirm extends Modal{
  constructor(app: App, onSubmit:(result:boolean)=>void, data?:entry, index?:number) {
    super(app);

  this.setTitle(`Confirm delete :`);
  
  const div = this.contentEl.createDiv();
  div.innerHTML = `email : ${data?.email}<br>name : ${data?.name}<br>notes : ${data?.notes}`

    new Setting(this.contentEl)
      .addButton((btn) =>
        btn
          .setButtonText('Confirm')
          .setCta()
          .onClick(() => {
            this.close();
            onSubmit(true);
          }));
  }
}