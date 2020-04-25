<template>
    <details>
        <summary>How do i use QSML?</summary>

        <section>
            <p>
                <strong>QSML</strong> is a strict superset of the <a href="https://www.wikidata.org/wiki/Help:QuickStatements">QuickStatements</a> (QS) 'command sequence' syntax, also known as the 'V1' syntax. Everything that works in regular QS will also work in QSML.
                QSML gives you a couple of extra commands (or 'macros') that make working with QS
                easier and faster. This tool is aimed at users who are already familiair with QS, and assumes you already have some experience using it.
            </p>

            <h2>Basic usage</h2>

            <p>
                For QSML, it is assumed you're using a spreadsheet like LibreOffice, OpenOffice, Excel or Google Spreadsheets or a text editor to do your editing and pasting it in the import textbox below.
            </p>

            <p>
                All QSML commands are prefixed by a backslash (\) and are always in the format <code>\command value</code> <em>except</em> for the <code>\def</code> command that you use to define macros. All commands are applied until the end of the given cell, which is defined in QS whenever a tab (\t) occurs.
            </p>

            <p>
                For example, to quote the string 'painting by Louis Dubois' in QSML, you simply prefix the string with the <code>\quote</code> command:
            </p>

            <p><code>\quote painting by Louis Dubois</code></p>

            <p>Which will convert to</p>

            <p><code>"painting by Louis Dubois"</code></p>

            <p>Because all strings need to be quoted in QS, but quotes can be difficult to manage in most spreadsheet software, the <code>\quote</code> command will save you a lot of irritation.</p>

            <p>Other commands work in the same way. For example, to add a year you do:</p>

            <p><code>\year 1858</code></p>

            <p>Which converts to</p>

            <p><code>+1858-00-00T00:00:00Z/9</code></p>

            <h2>Macros</h2>

            <p>
                Macros are a bit more complex, but can be very powerful. They allow you to define a list of QS commands and repeat them wherever you like in your code. This can be very useful to reuse a reference many times in your QS batch.
            </p>

            <p>
                For example, let's say that you have this reference that you want to reuse in multiple places:
            </p>

            <p><code>S854 "https://www.example.com/" S813 +2020-04-21T00:00:00Z/11 S407 Q7411</code></p>

            <p>
                You can use the <code>\def</code> command to define a macro. Macros can best be defined on their own row. Every cell that appears after the <code>\def</code> cell will become part of the macro. Note that you can still use all other QSML commands in your macro.
            </p>

            <p>
                So, if you want to define the previously mentioned reference as a macro, you could do this:
            </p>

            <p><code>\def ref1 S854 \quote https://www.example.com/ S813 \date 2020-04-21 S407 Q7411</code></p>

            <p>
                Now, everywhere after defining your macro you can use <code>\ref1</code> to expand your macro.
            </p>

            <p><code>P20 Q12887 \ref1</code></p>

            <p>Will convert to:</p>

            <p><code>P20 Q12887 S854 "https://www.example.com/" S813 +2020-04-21T00:00:00Z/11 S407 Q7411</code></p>

            <h2>List of macros</h2>

            <table>
                <thead>
                    <tr>
                        <th>Macro</th>
                        <th>Description</th>
                        <th>Example</th>
                        <th>Result</th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td>\def</td>
                        <td>Defines a macro: all the following cells in the same row will become the macro.
                            To use the macro, use <code>\name</code> anywhere after defining it. For example, to define a reference with the name <code>'ref1'</code> use <code>\def ref1</code>.</td>
                        <td>\ref1</td>
                        <td>S813  +2020-04-21T00:00:00Z/11 S407 Q7411</td>
                    </tr>

                    <tr>
                        <td>\quote</td>
                        <td>Quote all the text that follows.</td>
                        <td>\quote painting by Louis Dubois</td>
                        <td>"painting by Louis Dubois"</td>
                    </tr>

                    <tr>
                        <td>\rem</td>
                        <td>Add a comment that will not be shown in the result.</td>
                        <td>\rem This line adds an instance of (P31) claim</td>
                        <td>(nothing)</td>
                    </tr>

                    <tr>
                        <td>\year</td>
                        <td>Converts a year in the format YYYY to a QS-compatible timestamp.</td>
                        <td>\year 1858</td>
                        <td>+1858-00-00T00:00:00Z/9</td>
                    </tr>

                    <tr>
                        <td>\month</td>
                        <td>Converts timestamp in the format YYYY-MM to a QS-compatible timestamp.</td>
                        <td>\month 1830-12</td>
                        <td>+1830-12-00T00:00:00Z/10</td>
                    </tr>

                    <tr>
                        <td>\date</td>
                        <td>Converts timestamp in the format YYYY-MM-DD to a QS-compatible timestamp.</td>
                        <td>\date 2020-04-26</td>
                        <td>+2020-04-26T00:00:00Z/11</td>
                    </tr>

                    <tr>
                        <td>\today</td>
                        <td>Converts the current date to a QS-compatible timestamp.</td>
                        <td>\today</td>
                        <td>+2020-04-25T00:00:00Z/11</td>
                    </tr>
                </tbody>
            </table>
        </section>
    </details>
</template>