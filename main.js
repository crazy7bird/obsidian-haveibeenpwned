'use strict';

var obsidian = require('obsidian');

class HibpModal extends obsidian.Modal {
    constructor(app, onSubmit, data, index) {
        var _a, _b, _c, _d;
        super(app);
        this.setTitle(`Edit Email informations :`);
        let email = (_a = data === null || data === void 0 ? void 0 : data.email) !== null && _a !== void 0 ? _a : '';
        new obsidian.Setting(this.contentEl)
            .setName('Email')
            .addText((text) => {
            text
                .setValue(email)
                .onChange((value) => {
                email = value;
            });
        });
        let name = (_b = data === null || data === void 0 ? void 0 : data.name) !== null && _b !== void 0 ? _b : '';
        new obsidian.Setting(this.contentEl)
            .setName('Name')
            .addText((text) => {
            text
                .setValue(name)
                .onChange((value) => {
                name = value;
            });
        });
        let notes = (_c = data === null || data === void 0 ? void 0 : data.notes) !== null && _c !== void 0 ? _c : '';
        new obsidian.Setting(this.contentEl)
            .setName('Notes')
            .addText((text) => {
            text
                .setValue(notes)
                .onChange((value) => {
                notes = value;
            });
        });
        let breachs = (_d = data === null || data === void 0 ? void 0 : data.breachs) !== null && _d !== void 0 ? _d : [];
        new obsidian.Setting(this.contentEl)
            .addButton((btn) => btn
            .setButtonText('Submit')
            .setCta()
            .onClick(() => {
            this.close();
            onSubmit({
                entry: { email, name, notes, breachs },
                id: index !== null && index !== void 0 ? index : -1
            });
        }));
    }
}
class HibpConfirm extends obsidian.Modal {
    constructor(app, onSubmit, data, index) {
        super(app);
        this.setTitle(`Confirm delete :`);
        const div = this.contentEl.createDiv();
        div.innerHTML = `email : ${data === null || data === void 0 ? void 0 : data.email}<br>name : ${data === null || data === void 0 ? void 0 : data.name}<br>notes : ${data === null || data === void 0 ? void 0 : data.notes}`;
        new obsidian.Setting(this.contentEl)
            .addButton((btn) => btn
            .setButtonText('Confirm')
            .setCta()
            .onClick(() => {
            this.close();
            onSubmit(true);
        }));
    }
}

class HIBP extends obsidian.Plugin {
    async onload() {
        let gDatas = [];
        async function convertRawDatasJson(src) {
            //src = codeblockprocessor raw datas
            const Datas = JSON.parse(src);
            gDatas = Datas;
        }
        async function htmlDecoration(data, el) {
            const div = el.createDiv();
            const header = div.createEl("button", { text: `${data.name} - ${data.breachs.length} Breaches` });
            header.addClass("collapsible");
            const content = div.createDiv();
            content.addClass("content");
            const contentBtn = content.createDiv();
            contentBtn.createEl("button", { text: "✎", title: "Edit", onclick: () => { launchModal(data, gDatas.indexOf(data)); } });
            contentBtn.createEl("button", { text: "🗑", title: "Delete", onclick: () => { removeData(data, gDatas.indexOf(data)); } });
            const contentTxt = content.createDiv();
            contentTxt.innerHTML += `${data.email}</br>`;
            contentTxt.innerHTML += `<p>${data.notes}</p>`;
            for (const breach of data.breachs) {
                contentTxt.innerHTML += `<p>  -  ${breach.Name}</p>`;
                contentTxt.innerHTML += `<p>  -  ${breach.DataClasses}</p>`;
                contentTxt.innerHTML += `<p>  -  ${breach.Description}</p>`;
            }
            header.addEventListener("click", function () {
                this.classList.toggle("active");
                let content = this.nextElementSibling;
                if (content.style.display === "block") {
                    content.style.display = "none";
                }
                else {
                    content.style.display = "block";
                }
            });
        }
        const removeData = (data, id) => {
            new HibpConfirm(this.app, (result) => {
                // Modal confirm.
                gDatas.splice(id, 1);
                saveAndReRender();
            }, data, id).open();
        };
        function modalCallback(datas) {
            const data = datas.entry;
            const index = datas.id;
            if (data != null) {
                if (index > -1) {
                    gDatas[index] = data;
                }
                else {
                    gDatas.push(data);
                }
                saveAndReRender();
            }
        }
        const launchModal = (data, index) => {
            new HibpModal(this.app, (result) => { modalCallback(result); }, data, index).open();
        };
        function rendering(data, el) {
            el.empty();
            const r_btn = el.createEl("button", { text: "⟳", title: "Refresh" });
            r_btn.addEventListener("click", reloadHaveIBeenPwnd);
            const add_btn = el.createEl("button", { text: "+", title: "Add" });
            add_btn.addEventListener("click", function () { launchModal(); });
            for (const input of data) {
                htmlDecoration(input, el);
            }
        }
        async function saveAndReRender() {
            await saveDatas(gDatas, gCtx, gContext);
            rendering(gDatas, gEl);
        }
        async function reloadHaveIBeenPwnd() {
            await HaveIBeenPwnd(gDatas);
            await saveAndReRender();
        }
        async function HaveIBeenPwnd(datas) {
            const url_api = "https://haveibeenpwned.com/unifiedsearch/";
            for (const entry of datas) {
                try {
                    const email = entry.email.replace('@', "%40");
                    const answer = await obsidian.requestUrl(url_api + email);
                    entry.breachs = answer.json.Breaches;
                }
                catch (err) {
                    if (err.message.includes("404")) {
                        //Pas une erreur
                        entry.breachs = [];
                    }
                    else {
                        console.log(err);
                    }
                }
                finally {
                    //Wait between requests, for respect of haveibeenpwned.com
                    await new Promise(r => setTimeout(r, 101 + (Math.random() * 11)));
                }
            }
            gDatas = datas;
        }
        async function saveDatas(datas, ctx, context) {
            const file = context.app.vault.getAbstractFileByPath(ctx.sourcePath);
            if (file && file instanceof obsidian.TFile) {
                const content = await context.app.vault.read(file);
                const newContent = content.replace(/```hibp([\s\S]*?)```/, "```hibp\n" + JSON.stringify(datas) + "\n```");
                await context.app.vault.modify(file, newContent);
            }
        }
        let gEl = null;
        let gCtx = null;
        let gContext = null;
        this.registerMarkdownCodeBlockProcessor("hibp", async (source, el, ctx) => {
            gEl = el;
            gCtx = ctx;
            gContext = this;
            await convertRawDatasJson(source);
            rendering(gDatas, el);
        });
    }
}

module.exports = HIBP;
//# sourceMappingURL=main.js.map
