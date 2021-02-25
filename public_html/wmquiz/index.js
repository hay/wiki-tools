async function main(data) {
    new Vue({
        el : "#quiz",

        computed : {
            question() {
                const q = data[this.questionIndex];
                const answers = [];

                for (const key in q) {
                    if (['Ronde', 'Vraag'].includes(key)) {
                        continue;
                    }

                    const val = q[key];

                    // This is pretty ugly, but oh well
                    if (!(key in this.results)) {
                        this.results[key] = 0;
                    }

                    if (val !== '') {
                        answers.push({
                            project : key,
                            text : val
                        });
                    }
                }

                return {
                    question : q.Vraag,
                    answers : answers
                }
            },

            resultList() {
                const results = [];

                for (const project in this.results) {
                    results.push({
                        project : project,
                        score : this.results[project]
                    });
                }

                return results.sort((a, b) => a.score > b.score ? -1 : 1);
            },

            totalQuestions() {
                return this.data.length;
            }
        },

        data() {
            return {
                data : data,
                questionIndex : 0,
                results : {},
                screen : 'intro'
            };
        },

        methods : {
            again() {
                window.location = window.location;
            },

            answer(a) {
                this.results[a.project] += 1;

                if (this.questionIndex === (this.totalQuestions - 1)) {
                    this.screen = 'results';
                } else {
                    this.questionIndex++;
                }
            }
        }
    })
}

(async function() {
    const req = await window.fetch('data.json');
    const data = await req.json();
    main(data);
})();