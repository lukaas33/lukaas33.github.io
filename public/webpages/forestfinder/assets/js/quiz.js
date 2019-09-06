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

  get points () {
    let point = database.getStorage("points")
    if (point === null) { // Need to init
      point = 0
    }
    return point
  },
  set points (value) {
    let point = this.points
    point += value
    database.setStorage("points", point)
  },

  progress: null,
  points_per_correct: 5,
  streak_limit: 2,
  points_for_streak: 5,
  streak: 0,
  at: 0,

  start (info, progress) {
    progress.questions = {}
    for (let name of this.question_names)  { // Add empty answer objects
      progress["questions"][name] = {
        "answer": null,
        "user": null
      }
    }

    for (let question of this.question_names) { // Add correct answers
      let answer = info[`quiz_${question}`]
      progress.questions[question]["answer"] = answer
    }

    this.progress = progress
    this.setup(info)
  },
  setup (info) {
    const container = document.querySelector("#overlay")
    const box = document.createElement('div')

    const title = document.createElement('h2')
    title.textContent = "Quiz"
    box.appendChild(title)

    const name = document.createElement('h3')
    name.textContent = info.name
    box.appendChild(name)

    // User answer questions
    for (let question of this.question_names) { // All questions
      const part = document.createElement('div')
      const text = document.createElement('p')
      text.textContent = this.questions[question]

      part.appendChild(text)

      let select = document.createElement("select")
      select.appendChild(document.createElement('option')) // Empty input option
      for (let answer of this.possible_answers[question]) {
        let option = document.createElement('option')
        option.value = answer
        option.textContent = answer
        select.appendChild(option)
      }
      select.name = question

      select.addEventListener('input', this.check) // When user selects an option

      part.appendChild(select)
      box.appendChild(part)
    }

    // User take images
    const part = document.createElement('div')
    const text = document.createElement('p')
    text.textContent = "Maak met je telefoon een foto van de boom. (Het laden kan even duren.)"
    const image = document.createElement('input')
    image.type = 'file'
    image.accept = "image/*;capture=camera"
    image.id = 'photo'
    image.addEventListener('change', this.getImage)

    part.appendChild(text)
    part.appendChild(image)
    box.appendChild(part)

    container.appendChild(box)
    container.style.display = 'block'
  },

  end () {
    // Add to database
    try {
      database.progress = quiz.progress
    } catch (e) {
      console.error(e)
      delete quiz.progress.photos // Remove photos
      database.progress = quiz.progress // Append
      alert("Sorry, de foto kon niet opgeslagen worden.")
    } finally {
      quiz.at = 0
      quiz.progress = null
      document.querySelector("#overlay").style.display = 'none'
      document.querySelector("#overlay").innerHTML = ''
      document.getElementById("loading").style.display = 'none'
      herbarium.recents() // Display recents
    }
  },

  check (event) {
    const options = event.srcElement.options
    const value = options[options.selectedIndex].value

    const question = event.srcElement.name
    quiz.progress.questions[question]["user"] = value

    const answer = quiz.progress.questions[question]["answer"]

    if (value.toLowerCase() === answer.toLowerCase()) {
      quiz.points = quiz.points_per_correct // Add
      quiz.streak += 1

      if (quiz.streak > quiz.streak_limit) {
        quiz.points = (quiz.streak - quiz.streak_limit) * quiz.points_for_streak // Add
      }
    } else {
      quiz.streak = 0
    }

    event.srcElement.parentElement.style.display = 'none'
    quiz.at += 1
    if (quiz.at === 4) {
      quiz.end()
    }
  },

  getImage (event) {
    document.getElementById("loading").style.display = 'initial'
    window.setTimeout(() => {
      files = event.target.files
      quiz.progress.photos = []

      for (let i = 0; i < files.length; i ++) {
        if (files[i]["type"].indexOf("image") !== -1) { // Type like image/jpeg
          // Save in dataurlformat
          fileToDataUrl(files[i], (data) => {
            quiz.progress.photos.push(data)

            if (quiz.progress.photos) { // Not empty
              quiz.at += 1
              if (quiz.at === 4) {
                quiz.end()
              }
            }
          })
        } else {
          alert("Geen afbeelding gedetecteerd. Probeer het opnieuw.")
        }
      }
    }, 500) // Give time to return from input screen
  }
}

// Actions when user leaves page
window.onbeforeunload = () => {
  if (quiz.progress) {
    quiz.end()
  }
}
