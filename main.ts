import { Plugin, requestUrl, TFile} from "obsidian";

import { HibpModal,HibpConfirm } from "./modal";
import { entry } from "./entry"

export default class HIBP extends Plugin {
    async onload() {

        let gDatas:entry[]= [];
        async function convertRawDatasJson(src:string){
            //src = codeblockprocessor raw datas
            const Datas = JSON.parse(src);
            gDatas = Datas;
        }
        
        async function htmlDecoration(data:entry, el:HTMLElement){
            const div = el.createDiv();

            const header = div.createEl("button",{text:`${data.name} - ${data.breachs.length} Breaches`});
            header.addClass("collapsible");

            const content = div.createDiv();
            content.addClass("content");

            const contentBtn = content.createDiv();
            contentBtn.createEl("button",{text:"✎",title:"Edit", onclick:()=>{launchModal(data,gDatas.indexOf(data))}});
            contentBtn.createEl("button",{text:"🗑",title:"Delete",onclick:()=>{removeData(data,gDatas.indexOf(data))}});

            const contentTxt = content.createDiv()
            contentTxt.innerHTML += `${data.email}</br>`;
            
            contentTxt.innerHTML += `<p>${data.notes}</p>`;
            for(const breach of data.breachs){
                contentTxt.innerHTML += `<p>  -  ${breach.Name}</p>`;
                contentTxt.innerHTML += `<p>  -  ${breach.DataClasses}</p>`;
                contentTxt.innerHTML += `<p>  -  ${breach.Description}</p>`;
            }

            header.addEventListener("click",function() {
                this.classList.toggle("active");
                let content:any = this.nextElementSibling;
                if (content.style.display === "block") {
                    content.style.display = "none";
                } else {
                content.style.display = "block";
                }
            });
        }

    const removeData = (data:entry, id:number)=>{
        new HibpConfirm(this.app, (result)=>{
            // Modal confirm.
            gDatas.splice(id,1);
            saveAndReRender();
        },data,id ).open();
    }

    function modalCallback(datas:{entry:entry, id:number}){
            const data:entry = datas.entry;
            const index:number = datas.id;
            if(data != null){
                if(index>-1){
                    gDatas[index] = data;
                }
                else{
                    gDatas.push(data);
                }
                saveAndReRender();
            }
        }

        const launchModal = (data?:entry, index?:number) => {
            new HibpModal(this.app, (result)=>{modalCallback(result)},data,index ).open();
        };

        function rendering(data:entry[], el:HTMLElement){
            el.empty();

            const r_btn = el.createEl("button",{text:"⟳",title:"Refresh"});
            r_btn.addEventListener("click",reloadHaveIBeenPwnd);

            const add_btn = el.createEl("button",{text:"+",title:"Add"});
            add_btn.addEventListener("click",function(){launchModal()})
            for(const input of data){
                htmlDecoration(input, el );
            }
        }

        async function saveAndReRender(){
            await saveDatas(gDatas,gCtx,gContext);
            rendering(gDatas, gEl);
        }

        async function reloadHaveIBeenPwnd(){
            await HaveIBeenPwnd(gDatas);
            await saveAndReRender();
        }

        async function HaveIBeenPwnd(datas:entry[]){
            const url_api = "https://haveibeenpwned.com/unifiedsearch/";
            for(const entry of datas){
                try{
                    const email = entry.email.replace('@',"%40");
                    const answer = await requestUrl(url_api+email);
                    entry.breachs = answer.json.Breaches;
                }
                catch(err:any){
                    if(err.message.includes("404")){
                        //Pas une erreur
                        entry.breachs=[];
                    }
                    else{
                        console.log(err);
                    }
                }
                finally{
                    //Wait between requests, for respect of haveibeenpwned.com
                    await new Promise(r => setTimeout(r, 101 + (Math.random()*11)));
                }
            }
            gDatas = datas;
        }

        async function saveDatas(datas:entry[], ctx:any,context:any){
            const file = context.app.vault.getAbstractFileByPath(ctx.sourcePath);
            if(file && file instanceof TFile){
                const content = await context.app.vault.read(file);
                const newContent = content.replace(/```hibp([\s\S]*?)```/, "```hibp\n"+JSON.stringify(datas)+"\n```");
                await context.app.vault.modify(file,newContent);
            }
        }

        
        let gSource:any = null;
        let gEl:any = null;
        let gCtx:any = null;
        let gContext:any = null;
        this.registerMarkdownCodeBlockProcessor("hibp", async (source, el, ctx) => {
            gSource = source;
            gEl = el;
            gCtx = ctx;
            gContext = this;
            await convertRawDatasJson(source);
            rendering(gDatas, el);
        });
    }
}