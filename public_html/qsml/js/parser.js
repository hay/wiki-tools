const DEFAULT_OPTS = {
    cellSep : '\t',
    commandSep : '\n',
    urlCellSep : '|',
    urlCommandSep : '||'
};

const QS_ENDPOINT = "https://tools.wmflabs.org/quickstatements/#v1=";

function encodeUrl(url) {
    return url
        .replace(/\t/g, '%09')
        .replace(/"/g, '%22')
        .replace(/ /g, '%20')
        .replace(/\n/g, '%0A')
        .replace(/\//g, '%2F')
}

export default class Parser {
    constructor(input, opts = {}) {
        this.input = input;
        this.opts = Object.assign(DEFAULT_OPTS, opts);
        this.data = [];
        this.line = 0;
        this.defs = {};
    }

    getData() {
        return this.data
            .map(line => line.join(this.opts.cellSep))
            .join(this.opts.commandSep);
    }

    getDateType(date) {
        if (/\d{4}-\d{2}-\d{2}$/.test(date)) return 'date';
        if (/\d{4}-\d{2}$/.test(date)) return 'month';
        if (/\d{4}$/.test(date)) return 'year';

        return false;
    }

    getUrl() {
        const arg = this.data
            .map(line => line.join(this.opts.urlCellSep))
            .join(this.opts.urlCommandSep);

        return QS_ENDPOINT + encodeUrl(arg);
    }

    parse() {
        for (const line of this.input.split(this.opts.commandSep)) {
            let row = [];
            let curdef = false;
            this.line++;

            for (let cell of line.split(this.opts.cellSep)) {
                cell = cell.trim();

                // If we have a backslash as the very first character, it's
                // a command. Do something with it
                if (!cell.length || cell[0] !== "\\") {
                    // Not a command
                    if (curdef) {
                        this.defs[curdef].push(cell);
                    } else {
                        row.push(cell);
                    }

                    continue;
                }

                // The command is delimited by a space
                let cmd, val;

                if (cell.includes(' ')) {
                    const spacePos = cell.indexOf(' ');
                    const parts = [cell.slice(0, spacePos), cell.slice(spacePos + 1)];
                    cmd = parts[0].slice(1); // Cut off the \
                    val = parts[1];
                } else {
                    // No argument, this is the case with macros
                    cmd = cell.slice(1);
                    val = null;
                }

                if (cmd === 'rem') {
                    // Remark, do nothing
                    continue;
                } else if (cmd === 'quote') {
                    val = `"${val}"`;
                } else if (cmd === 'date') {
                    val = this.parseDate(val);
                } else if (cmd === 'today') {
                    const now = new Date().toISOString().slice(0, 10);
                    val = this.parseDate(now);
                } else if (cmd === 'def') {
                    // Define a macro
                    curdef = val;
                    this.defs[curdef] = [];
                    continue;
                } else if (cmd in this.defs) {
                    // Expand the macro, don't put it in the final output!
                    row = row.concat(this.defs[cmd]);
                } else {
                    throw Error(`Unknown command: ${cmd}`);
                }

                if (curdef) {
                    this.defs[curdef].push(val);
                } else {
                    row.push(val);
                }
            }

            curdef = false;

            // Remove any falsy values before adding
            row = row.filter(row => !!row);
            this.data.push(row);
        }

        // Remove empty lines and cells
        this.data = this.data.filter(row => !!row && row.length);
    }

    parseDate(val) {
        const type = this.getDateType(val);

        if (!type) throw new Error('Invalid date');

        if (type === 'year') return `+${val}-00-00T00:00:00Z/9`;
        if (type === 'month') return `+${val}-00T00:00:00Z/10`;
        if (type === 'date') return `+${val}T00:00:00Z/11`;
    }
}