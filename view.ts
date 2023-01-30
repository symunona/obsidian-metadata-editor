import { ItemView, WorkspaceLeaf } from "obsidian";

import { getAPI } from "main";

import { getAPI as getDataViewApi } from "obsidian-dataview";

export const META_DATA_VIEW_TYPE = "meta-data-type";

const MAX_LIST = 10

export class MetaDataViewTable extends ItemView {

  dataViewApi = getDataViewApi();

  api;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
    this.api = getAPI(this.app)
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
		const header = container.createDiv();
		const error = container.createDiv();
		const results = container.createDiv();
		if (this.api) {
			this.api.folderMeta;
			header.createEl("h4", { text: "Meta Dataview Index" });
		} else {
			header.createEl("h4", { text: "Loading Meta Index" });
		}

		const search = container.createEl("input", {
			value: "",
			cls: "full-width filter",
			placeholder: "filter",
		});

    search.addEventListener("change", async (ev)=>{
      console.log('change' , search.value)
      error.createSpan('Loading...')
      if (!this.dataViewApi) { return }

      const data = await this.dataViewApi.query('table file where ' + search.value)

      error.empty()
      results.empty()

      if (data.successful){
        results.createEl('i', { text: `Found ${data.value.values.length} files`})

        const resultListEl = results.createEl('ul')
        const foundFileNames = data.value.values.slice(0, MAX_LIST).map((item)=>{
          return item[0].path
        })

        foundFileNames.forEach(name => resultListEl.createEl('li', {text: name}))

        const foundFiles = data.value.values.map((item)=>{
          return item[1]
        })
        const metaPropertiesOfList = this.api.folderMeta.createMetaIndex(foundFiles, this.dataViewApi.index)

        const metaAttrContainer = results.createEl('ul', {cls: 'bordered-container'})
        Object.keys(metaPropertiesOfList).map(attrKey=>{
          const metaAttrItemEl = metaAttrContainer.createEl('li')
          metaAttrItemEl.createSpan({text: attrKey})
          metaAttrItemEl.createEl('i', {
            cls: 'faded-value-list',
            text: metaPropertiesOfList[attrKey].join(', ')})
        })

      } else {
        error.createEl('p', {text: 'Query Error:'})
        error.createEl('pre', {text: data.error})
      }
      console.warn('data', data)

    })

		// container.createEl("input", {
		//   value: "I am an input",
		//   placeholder: "anything, really",
		// });
		// Here
	}

	async onClose() {
		// Nothing to clean up.
	}
}
