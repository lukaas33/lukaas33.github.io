math =
  ### More specific math object for project ###
  abs: Math.abs
  ceil: Math.ceil
  floor: Math.floor
  log: Math.log
  max: Math.max
  min: Math.min

random =
  ### Different functions regarding random ###
  random: Math.random()
  randint: (min, max, inclusive = false) ->
    # if not min? or not max?
      # throw # Error
      #   name: "Input error"
      #   message: "Not all required arguments were given"
      #   toString: -> "#{@name}: #{@message}"
    # else if min >= max
      # throw # Error
      #   name: "Input error"
      #   message: "The input entered was invalid"
      #   toString: -> "#{@name}: #{@message}"

    max =+ 1 if inclusive
    Math.floor Math.random() * (max - min) + min

  choice: (array) ->
    # if array.length <= 1
      # throw # Error
      #   name: "Input error"
      #   message: "The array entered was too short"
      #   toString: -> "#{@name}: #{@message}"

console.log math.ceil 1.2
console.log random.randint(2, 4)
random.choice [1, 2]
