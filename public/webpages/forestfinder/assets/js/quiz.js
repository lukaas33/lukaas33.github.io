const quiz = {
  get question_names () { // get only
    return ["form", "edge", "lines"]
  },
  get possible_answers () { // Get only
    return {
      "form": ['Enkelvoudig', 'Samengesteld'],
      "edge": ['Gaaf', 'Gekarteld', 'Gelobd', 'Gezaagd', 'Getand'],
      "lines": ['Veernervig', 'Handnervig', 'Parallelnervig']
    }
  },

  answers: [],

  start (info) {
    for (let question of this.question_names) {
      let answer = info[`quiz_${question}`]
      this.answers.push(answer)
    }


  },
  setup () {
    for (let question of this.question_names) {
      let select = document.createElement("select")
      for (let answer of this.possible_answers[question]) {
        let option = document.createElement('option')
        option.value = answer.toLowerCase()
        option.textContent = answer
        select.appendChild(option)
      }
      select.name = question
    }
  },

  check (name, choice) {

  }
}
