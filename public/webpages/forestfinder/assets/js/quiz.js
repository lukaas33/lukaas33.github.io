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
  get questions () { // Get only
    return {
      "form": "Welke vorm heeft dit blad?",
      "edge": "Wat voor bladranden heeft deze boom?",
      "lines": "Welke nervatuur heeft het blad?"
    }
  },

  answers: {
    "form": null,
    "edge": null,
    "lines": null
  },

  start (info) {
    for (let question of this.question_names) {
      let answer = info[`quiz_${question}`]
      this.answers[question] = answer
    }

    this.setup(info)
  },
  setup (info) {
    const container = document.querySelector("#overlay")
    const box = document.createElement('div')

    const name = document.createElement('h3')
    name.textContent = info.name
    box.appendChild(name)

    for (let question of this.question_names) { // All questions
      const part = document.createElement('div')
      const text = document.createElement('p')
      text.textContent = this.questions[question]

      part.appendChild(text)

      let select = document.createElement("select")
      select.appendChild(document.createElement('option')) // Empty input option
      for (let answer of this.possible_answers[question]) {
        let option = document.createElement('option')
        option.value = answer.toLowerCase()
        option.textContent = answer
        select.appendChild(option)
      }
      select.name = question

      select.addEventListener('input', this.check) // When user selects an option

      part.appendChild(select)
      box.appendChild(part)
    }

    container.appendChild(box)
    container.style.display = 'block'
  },

  check (event) {
    const options = event.srcElement.options
    const value = options[options.selectedIndex].value
    const question = event.srcElement.name

    if (value === this.answers[question]) {
      
    }

    event.srcElement.style.display = 'none'
  }
}
