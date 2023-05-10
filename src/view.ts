import { ItemView, Notice, WorkspaceLeaf } from "obsidian";

import { getAPI } from "./main";

import { getAPI as getDataViewApi } from "obsidian-dataview";
import { createTreeFromFileMap } from "utils";
import { MetaDataViewTableRender } from "./ui/render-table";
import { createMetaIndex } from "./utils/folder-meta";
import { SearchInputWithHistory } from "./ui/search-history";
import { exportSelection } from "./export/exporter";

export const META_DATA_VIEW_TYPE = "meta-data-type";

export const MAX_META_VALUE_LENGTH_TO_DISPLAY = 20;

// const MAX_LIST = 10;

export class MetaDataViewTableView extends ItemView {
	dataViewApi = getDataViewApi();
	api;
	header: HTMLElement;
	error: HTMLElement;
	results: HTMLElement;
	searchInput: SearchInputWithHistory
	exportButton: HTMLButtonElement;
	topRightMenuContainer: HTMLDivElement;
	lastFoundFileList: any[];

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
		this.api = getAPI(this.app);
	}

	getIcon() {
		return "file-spreadsheet";
	}

	getViewType() {
		return META_DATA_VIEW_TYPE;
	}

	getDisplayText() {
		return "Meta Dataview";
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();
		container.classList.add('meta-data-view')
		this.header = container.createDiv();
		this.error = container.createDiv();
		this.results = container.createDiv();
		if (this.api) {
			this.api.folderMeta;
			this.topRightMenuContainer = this.header.createDiv({cls: 'top-right-button-conainer'})
			this.exportButton = this.topRightMenuContainer.createEl('button', { text: "Export ..."})
			this.exportButton.addEventListener('click', ()=>{
				if (this.lastFoundFileList && this.lastFoundFileList.length){
					exportSelection(this.lastFoundFileList)
				} else {
					new Notice('Hmmm... Nothing to export.')
				}
			})
			this.header.createEl("h4", { text: "Bulk Metadata Manipulator" });
		} else {
			this.header.createEl("h4", { text: "Loading Meta Index" });
		}



		// @ts-ignore
		const initialQuery = this.app.plugins.plugins['meta-dataview'].settings.exportQuery
		this.searchInput = new SearchInputWithHistory(
			this.header,
			(query) => this.searchQuery(query),
			initialQuery)


		if (initialQuery) {
			this.searchQuery(initialQuery)
		}
	}

	async searchQuery(userQuery: string) {

		this.error.createSpan("Loading...");

		// Smart WHERE: by default, DataView queries include a where statement.
		// Let's assume that it's the filter query.
		let query = ''
		if (userQuery.startsWith('from') ||
			userQuery.startsWith('where') ||
			userQuery.startsWith('group by') ||
			userQuery.startsWith('limit') ||
			userQuery.startsWith('flatten')) {
			query = "table file " + userQuery
		} else {
			// Assume the where
			query = "table file where " + userQuery
		}

		// Get the actual query results from DataView API.
		if (!this.dataViewApi) {
			this.error.innerText = "Dataview plugin is not loaded!"
			throw new Error("Dataview plugin is not loaded!")
		}
		// @ts-ignore
		const data = await this.dataViewApi.query(query);

		this.error.empty();
		this.results.empty();

		if (data.successful) {
			// new HeaderTabs
			this.results.createEl("i", {
				text: `Found ${data.value.values.length} files`,
			});

			const resultListEl = this.results.createEl("div", { cls: 'nav-files-container meta-data-view-table-container' });

			const foundFileNames = data.value.values
				.map((item) => {
					return item[0].path;
				});

			const fileTree = createTreeFromFileMap(foundFileNames);
			// console.log(fileTree)
			// renderTree(resultListEl, fileTree)

			const foundFileMap: { [key: string]: Array<any> } = {}
			const foundFiles = this.lastFoundFileList = data.value.values.map((item) => {
				foundFileMap[item[1].path] = item[1]
				return item[1];
			});

			// console.log(data, foundFileMap)
			const metaPropertiesOfList =
				createMetaIndex(
					foundFiles,
					// @ts-ignore
					this.dataViewApi.index
				);

			//const tableUI =
			new MetaDataViewTableRender(
				resultListEl,
				fileTree,
				metaPropertiesOfList,
				foundFileMap,
				(query) => this.searchInput.set(query))


			const metaAttrContainer = this.results.createEl("ul", {
				cls: "bordered-container",
			});
			Object.keys(metaPropertiesOfList).map((attrKey) => {
				const metaAttrItemEl = metaAttrContainer.createEl("li");
				metaAttrItemEl.createSpan({ text: attrKey });
				// console.warn(metaPropertiesOfList)

				if (metaPropertiesOfList[attrKey].length &&
					metaPropertiesOfList[attrKey][0]?.length < MAX_META_VALUE_LENGTH_TO_DISPLAY) {
					metaPropertiesOfList[attrKey].forEach((metaValue) => {
						metaAttrItemEl.createEl("i", {
							cls: "faded-value-list",
							text: metaValue
						})
						metaAttrItemEl.createSpan({ text: ' ' })
					})
				} else {
					metaAttrItemEl.createEl('i', { cls: "faded-value-list", text: '...' })
				}
			});
		} else {
			this.error.createEl("p", { text: "Query Error:" });
			this.error.createEl("pre", { text: data.error });
		}
		return data
	}


	async onClose() {
		// Nothing to clean up.
	}
}
