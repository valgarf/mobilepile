export interface Address {
  address: string; // email address "stefan@j-schulz.de",
  "crypto-policy"?: string; // "best-effort",
  "flags": {
    profile?: boolean;
    secure?: boolean;
  };
  fn: string; // Name
  keys?: [{
    fingerprint: string;
    mime: string; // e.g. "application/x-pgp-fingerprint",
    type: string; // e.g. "openpgp"
  }],
  photo?: string; //encoded photo, e.g. "data:image/jpeg;base64,iVBO..."
  protocol: string // e.g. "smtp",
  rank: number; // ???
  "x-mailpile-rid"?: string // "e65587ba592"
}

export interface Mail {

}

export interface MailMetadata {
  body: {
    list?: string; //email of an email-ist this is sent to  "fachschaft@fachschaft.physik.tu-darmstadt.de",
    snippet: string; // start of the message "Hallo zusammen! Die Fachschaftssitzung wird ab"
  };
  // cc_aids: [], // ???
  crypto: {
    encryption: string; // "none" for no encryption
    signature: string; //"none"
  };
  flags: {
    unread: boolean;
  };
  from: {
    address: string; // email address of the sender"marco.knoesel@t-online.de",
    aid: string; // ID of the address
    // flags: {}  // ???,
    fn:  string; // Name of the sender "Marco Knösel",
    protocol: string; // protocol used, most-likely "smtp",
    rank: number; // ???
  };
  id: string; // ???  longish id, no idea what for
  mid: string; // id of the metadata (and message?),
  msg_kb: number; // size of the message in kb ???,
  parent_mid: string; // parent metadata id??, something with threads... can be the same as the mid (when there is no parent? strange choice...)
  subject: string;
  tag_tids: [string];
  thread_mid: string; // ??? not quite sure yet.... maybe id of first message in thread? or id of the thread?
  timestamp: number; // typical json format
  to_aids: [string]; // receiver adresses
  urls: {
      source: string; //direct url to the message
      thread: string; //direct url to the thread
  }
}

export interface Tag {
  display: string; //"tag" oder "invisible"
  icon: string; //icon name
  label: boolean;
  // label_color: color; //string?
  name: string;
  parent: string; // ID of the parent tag (if no parent: "")
  search_terms: string; // search term, may contain yet to be resolved variables (e.g. "%(slug)" )
  slug: string;
  tid: string; // ID of this tag
  type: string;
  url: string; //url on server (contains '/mailpile' link)
}


export interface ResultLogin {
  login_banner: string;
  login_failures: [number]; // timestamps of failures ???
}

// export type MessageThread = [string | MessageThread];
// export type MessageThread = any;
export type MessageEntry = [string, "", [any]] | [string, "└", [any]] | [string, "r", [string]]
export type MessageThread = [MessageEntry];

export interface ResultSearch {
  address_ids: [string]; // ??? not used, empty all the time
  data: {
    addresses: { [aid:string]: Address };
    messages: { [mid:string]: Mail };
    metadata: { [mid:string]: MailMetadata };
    tags: { [tid:string]: Tag };
    threads: { [mid:string]: MessageThread  };
  }
  message_ids: [string]; /// ??? not used, empty all the time,
  search_tag_ids: [string]; // ???
  search_terms: [string]; // terms of the search, default: "all:mail"
  stats: {
     count: number; // default: 20,
     end: number; // default: 20,
     start: number; // default:  1,
     total: number; // number of search results
   },
   summary: string; //Search description default: "Search: all:mail",
   thread_ids: [string]; //the ordered result of the search as thread_ids
   view_pairs: {}; // ???
}

export interface ServerResponse {
  command: string; // e.g. 'login'
  status: string; // 'error' or ?
  message: string;
  result: ResultLogin | ResultSearch; // one of the subinterfaces
}
