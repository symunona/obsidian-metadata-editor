import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import { META_DATA_VIEW_TYPE, MetaDataViewTable } from "view";

import { getAPI as getDataViewApi } from "obsidian-dataview";
import { FolderMeta } from "folder-meta";


// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "default",
};

export default class MetaDataView extends Plugin {
	settings: MyPluginSettings;

	// metaFolderCache: { [filePath: string]: any } = {};
	// metaFolderAttributeCache: { [folderPath: string]: any } = {};
	folderMeta: FolderMeta;

	dataViewApi = getDataViewApi();

	async onload() {
		// const { vault } = this.app;

		await this.loadSettings();

		this.registerView(
			META_DATA_VIEW_TYPE,
			(leaf) => new MetaDataViewTable(leaf)
		);

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"file-spreadsheet",
			"Meta Dataview",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				// new Notice("This is a notice!");
				this.activateView();
				// console.warn("this updated");
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "open-sample-modal-simple",
			name: "Open sample modal (simple)",
			callback: () => {
				new SampleModal(this.app).open();
			},
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "sample-editor-command",
			name: "Sample editor command",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection("Sample Editor Command");
			},
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: "open-sample-modal-complex",
			name: "Open sample modal (complex)",
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, "click", (evt: MouseEvent) => {
		// 	console.log("click", evt);
		// });

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(
		// 	window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		// );

		this.registerEvent(
			this.app.vault.on("modify", (e) => {
				console.warn("update caught", e);
			})
		);

		// console.log('pages', )

		this.registerEvent(
			this.app.metadataCache.on("resolved", () => {
				console.log("dataview ready");
				if (this.dataViewApi) {
					this.folderMeta = new FolderMeta(this.dataViewApi.index);
					console.log("yaaay", this.folderMeta);
				} else {
					new Notice(
						"Meta-Dataview needs Dataview plugin to be installed."
					);
				}
			})
		);

		console.log("api: ", this.dataViewApi);
		if (this.dataViewApi) {
			this.folderMeta = new FolderMeta(this.dataViewApi.index);
		}

		// console.log(dataViewApi.index.pages);
		// this.registerEvent(this.app.metadataCache.on("dataview:index-ready", () => {
		// });

		// this.app.metadataCache.on("dataview:index-ready", () => {});

		// const basePath = this.app.vault.adapter.basePath;

		// vault.getMarkdownFiles().slice(0,10).map(async (file)=>{
		// 	const content = await vault.cachedRead(file)
		// 	console.log(content)
		// })
		// const plugins = this.app.plugins as { [id: string] Plugin>
		// if (!this.app.plugins?.plugins?.dataview?.api){
		// 	console.error('Dataview plugin did not load yet!')
		// } else {
		// 	console.log(this.app.plugins.plugins.dataview.api)
		// }
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async activateView() {
		this.app.workspace.detachLeavesOfType(META_DATA_VIEW_TYPE);

		await this.app.workspace.getRightLeaf(false).setViewState({
			type: META_DATA_VIEW_TYPE,
			active: true,
		});

		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(META_DATA_VIEW_TYPE)[0]
		);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Woah!");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MetaDataView;

	constructor(app: App, plugin: MetaDataView) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Settings for my awesome plugin." });

		new Setting(containerEl)
			.setName("Setting #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						console.log("Secret: " + value);
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					})
			);
	}
}

// @ts-ignore
export const getAPI = (app?: App): MetaDataviewApi | undefined => {
	// @ts-ignore
	if (app) return app.plugins.plugins["meta-dataview"];
};
