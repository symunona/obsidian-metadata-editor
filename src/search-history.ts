import { Result } from "obsidian-dataview";
import { QueryResult } from "obsidian-dataview/lib/api/plugin-api";

export type CallbackFunction = (query: string) => Promise<Result<QueryResult, string>>;

export class SearchInputWithHistory{
    history: Array<HistoryItem> = []
    searchElement: HTMLInputElement
    searchCallback: CallbackFunction

    constructor(leaf: HTMLElement, searchCallback: CallbackFunction, initialQuery: string){
		this.searchElement = leaf.createEl("input", {
			value: initialQuery,
			cls: "full-width filter",
			placeholder: "dataview style filter e.g. metakey = test",
		});
        this.searchCallback = searchCallback;
        this.searchElement.addEventListener("change", ()=>this.doSearch())
        this.searchElement.addEventListener('keypress', (evt: KeyboardEvent)=>{
            if (evt.key === 'ArrowUp'){
                console.error('AAAA')
            }
        })

    }
    set(value: string){
        this.searchElement.value = value
        this.doSearch()
    }

    async doSearch(){
        const query = this.searchElement.value.toLowerCase().trim()
        if (query.length){
            const newHistoryItem = new HistoryItem(query)
            this.history.push(newHistoryItem)
            const data = await this.searchCallback(this.searchElement.value.toLowerCase().trim())
            newHistoryItem.successful = data.successful;
        }
    }
}

class HistoryItem{
    query: string
    successful: boolean
    constructor(query: string){
        this.query = query
    }
}