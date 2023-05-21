function getTickets(numTickets) {
    const tambala = [];
    for (let i = 0; i < 3; i++) {
        tambala.push(new Array(9).fill(0));
    }

    // Generate random positions for each row in the ticket
    const positionRandom = [];
    for (let i = 0; i < 5; i++) {
        let pos = Math.floor(Math.random() * 9);
        while (positionRandom.includes(pos)) {
            pos = Math.floor(Math.random() * 9);
        }
        positionRandom.push(pos);
        tambala[0][pos] = 1;
        tambala[2][pos] = 1;
    }

    // Assign 1 to the remaining positions in the second row
    for (let j = 0; j < 9; j++) {
        if (tambala[0][j] === 0) {
            tambala[1][j] = 1;
        }
    }

    // Find an empty position in the second row and assign 1 to it
    for (let j = 0; j < 9; j++) {
        if (tambala[1][j] === 0) {
            let x = Math.floor(Math.random() * 9);
            while (tambala[1][x] !== 0) {
                x = Math.floor(Math.random() * 9);
            }
            tambala[1][x] = 1;
            break;
        }
    }

    // Generate random numbers for each column of the ticket
    for (let j = 0; j < 9; j++) {
        let count = 0;
        for (let i = 0; i < 3; i++) {
            if (tambala[i][j] === 1) {
                count++;
            }
        }

        const numbers = [];
        // Generate random numbers for each column
        for (let k = 0; k < count; k++) {
            if (j === 0) {
                numbers[k] = Math.floor(Math.random() * 9) + 1;
            } else {
                numbers[k] = Math.floor(Math.random() * 10) + j * 10;
            }

            // Check for repeated numbers
            for (let l = 0; l < k; l++) {
                if (numbers[k] === numbers[l]) {
                    k--;
                    break;
                }
            }
        }

        // Sort the generated numbers in ascending order
        numbers.sort((a, b) => a - b);
        let k = 0;

        // Assign the generated numbers to the respective positions in each column
        for (let i = 0; i < 3; i++) {
            if (tambala[i][j] === 1) {
                tambala[i][j] = numbers[k++];
            }
        }
    }

    return tambala;
}

module.exports = getTickets;
