export interface ServerResponse {
  command: string; // e.g. 'login'
  status: string; // 'error' or ?
  message: string;
}

export interface Tag {
  display: string; //"tag" oder "invisible"
  icon: string; //icon name
  label: boolean;
  // label_color: color;
  name: string;
  parent: string; // ID of the parent tag (if no parent: "")
  search_terms: string; // search term, may contain yet to be resolved variables (e.g. "%(slug)" )
  slug: string;
  tid: string; // ID of this tag
  type: string;
  url: string; //url on server (contains '/mailpile' link)


}
