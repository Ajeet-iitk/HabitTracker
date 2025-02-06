// Load habits from localStorage on page load
document.addEventListener('DOMContentLoaded', () => {
    loadHabits();
    updateHabitCount(); // Update habit count on page load
    enableDragAndDrop(); // Enable drag-and-drop functionality
});

// Function to save habits to localStorage
function saveHabits(habits) {
    localStorage.setItem('habits', JSON.stringify(habits));
    updateHabitCount(); // Update habit count after saving
}

// Function to load habits from localStorage
function loadHabits() {
    const habits = JSON.parse(localStorage.getItem('habits')) || [];
    const habitList = document.getElementById('habit-list');
    habitList.innerHTML = ''; // Clear the list before rendering

    habits.forEach((habit, index) => {
        const habitItem = document.createElement('div');
        habitItem.classList.add('habit-item');
        habitItem.setAttribute('draggable', true); // Make the habit item draggable
        habitItem.dataset.index = index; // Store the habit's index as a data attribute

        // Habit Header (Collapsible)
        const habitHeader = document.createElement('div');
        habitHeader.classList.add('habit-header');

        const habitNameContainer = document.createElement('div');
        habitNameContainer.style.display = 'flex';
        habitNameContainer.style.alignItems = 'center';

        const habitName = document.createElement('h3');
        habitName.textContent = habit.name;

        // Completed Days Counter
        const completedDaysCounter = document.createElement('span');
        completedDaysCounter.textContent = `Completed: ${habit.completedDays.length}/21`;
        habitName.appendChild(completedDaysCounter);

        // Edit Button
        const editBtn = document.createElement('button');
        editBtn.textContent = '✎'; // Pencil icon for edit
        editBtn.classList.add('edit-btn');
        editBtn.addEventListener('click', () => editHabitName(habitName, index));

        habitNameContainer.appendChild(habitName);
        habitNameContainer.appendChild(editBtn);

        const toggleDetailsBtn = document.createElement('span');
        toggleDetailsBtn.textContent = '▼';
        toggleDetailsBtn.style.cursor = 'pointer';

        // Information Button
        const infoBtn = document.createElement('button');
        infoBtn.textContent = 'ℹ️';
        infoBtn.classList.add('info-btn');
        infoBtn.addEventListener('click', () => showInfoModal(habit));

        habitHeader.appendChild(habitNameContainer);
        habitHeader.appendChild(toggleDetailsBtn);
        habitHeader.appendChild(infoBtn);

        // Habit Details (Days)
        const habitDetails = document.createElement('div');
        habitDetails.classList.add('habit-details');

        const daysContainer = document.createElement('div');
        daysContainer.classList.add('days-container');

        // Generate 21 days with dates
        const startDate = new Date();
        for (let i = 0; i < 21; i++) {
            const dayBox = document.createElement('div');
            dayBox.classList.add('day-box');

            const dayDate = new Date(startDate);
            dayDate.setDate(startDate.getDate() + i);

            // Format date as DD/MM/YYYY
            const formattedDate = `${String(dayDate.getDate()).padStart(2, '0')}/${String(dayDate.getMonth() + 1).padStart(2, '0')}/${dayDate.getFullYear()}`;
            dayBox.textContent = formattedDate;

            // Check if this day is completed
            if (habit.completedDays && habit.completedDays.includes(formattedDate)) {
                dayBox.classList.add('completed');
            }

            // Add click event to toggle completion
            dayBox.addEventListener('click', () => {
                toggleDayCompletion(index, formattedDate, dayBox, completedDaysCounter);
            });

            daysContainer.appendChild(dayBox);
        }

        habitDetails.appendChild(daysContainer);

        // Delete Button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', () => deleteHabit(index));

        // Toggle Habit Details
        toggleDetailsBtn.addEventListener('click', () => {
            if (habitDetails.classList.contains('open')) {
                habitDetails.classList.remove('open');
                toggleDetailsBtn.textContent = '▼';
                toggleDetailsBtn.classList.remove('rotate');
            } else {
                habitDetails.classList.add('open');
                toggleDetailsBtn.textContent = '▲';
                toggleDetailsBtn.classList.add('rotate');
            }
        });

        habitItem.appendChild(habitHeader);
        habitItem.appendChild(habitDetails);
        habitItem.appendChild(deleteBtn);

        habitList.appendChild(habitItem);
    });
}

// Function to add a new habit
document.getElementById('add-habit-btn').addEventListener('click', () => {
    addNewHabit();
});

// Press Enter to Add Habit
document.getElementById('new-habit').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addNewHabit();
    }
});

function addNewHabit() {
    const newHabitInput = document.getElementById('new-habit');
    const habitName = newHabitInput.value.trim();

    if (habitName) {
        const habits = JSON.parse(localStorage.getItem('habits')) || [];
        habits.push({
            name: habitName,
            completedDays: [],
            creationDate: new Date(),
            reminder: null
        });
        saveHabits(habits);
        newHabitInput.value = '';
        loadHabits();
    }
}

// Function to toggle day completion
function toggleDayCompletion(habitIndex, dayDate, dayBox, completedDaysCounter) {
    const habits = JSON.parse(localStorage.getItem('habits'));
    const habit = habits[habitIndex];

    if (habit.completedDays.includes(dayDate)) {
        habit.completedDays = habit.completedDays.filter(date => date !== dayDate);
        dayBox.classList.remove('completed');
    } else {
        habit.completedDays.push(dayDate);
        dayBox.classList.add('completed');
        showConfetti(); // Show confetti when a day is completed
    }

    completedDaysCounter.textContent = `Completed: ${habit.completedDays.length}/21`;
    saveHabits(habits);
}

// Function to show confetti
function showConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });

    alert("Congratulations! You've completed a day!");
}

// Function to delete a habit
function deleteHabit(index) {
    const habits = JSON.parse(localStorage.getItem('habits'));
    habits.splice(index, 1);
    saveHabits(habits);
    loadHabits();
}

// Function to edit habit name
function editHabitName(habitNameElement, habitIndex) {
    const habits = JSON.parse(localStorage.getItem('habits'));

    // Reference the specific habit by index
    const habit = habits[habitIndex];

    // Create an input field
    const input = document.createElement('input');
    input.type = 'text';
    input.value = habit.name;
    input.classList.add('edit-input');

    // Replace the habit name with the input field
    habitNameElement.replaceWith(input);

    // Focus on the input field
    input.focus();

    // Save the new habit name when pressing Enter or clicking outside
    const saveHabitName = () => {
        const newName = input.value.trim();

        if (newName) {
            habit.name = newName;
            saveHabits(habits);

            habitNameElement.textContent = newName;
            input.replaceWith(habitNameElement);
        } else {
            alert("Habit name cannot be empty!");
            input.value = habit.name; // Restore the original name
        }
    };

    // Save on pressing Enter
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveHabitName();
        }
    });

    // Save on clicking outside
    input.addEventListener('blur', saveHabitName);
}

// Update Habit Count
function updateHabitCount() {
    const habits = JSON.parse(localStorage.getItem('habits')) || [];
    document.getElementById('habit-count').textContent = `Total Habits: ${habits.length}`;
}

// Show Info Modal
function showInfoModal(habit) {
    const modal = document.getElementById('info-modal');
    const closeBtn = document.getElementsByClassName('close')[0];
    const habitName = document.getElementById('info-habit-name');
    const creationDate = document.getElementById('info-creation-date');
    const reminderStatus = document.getElementById('info-reminder-status');

    // Populate modal content
    habitName.textContent = habit.name;
    creationDate.textContent = new Date(habit.creationDate).toLocaleDateString();
    reminderStatus.textContent = habit.reminder
        ? `Reminder set for ${new Date(habit.reminder).toLocaleString()}`
        : 'No reminder set';

    // Show the modal
    modal.style.display = 'block';

    // Close the modal when clicking the close button
    closeBtn.onclick = function () {
        modal.style.display = 'none';
    };

    // Close the modal when clicking outside the modal
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}

// Set reminder using browser notifications
document.getElementById('set-reminder-btn').addEventListener('click', () => {
    const reminderDatetime = document.getElementById('reminder-datetime').value;
    const reminderMessage = document.getElementById('reminder-message');

    if (!reminderDatetime) {
        alert("Please select a valid date and time for the reminder.");
        return;
    }

    const reminderTime = new Date(reminderDatetime).getTime();
    const currentTime = new Date().getTime();

    if (reminderTime <= currentTime) {
        alert("Please select a future date and time for the reminder.");
        return;
    }

    const timeDifference = reminderTime - currentTime;

    // Display confirmation message
    reminderMessage.textContent = `Reminder set for ${new Date(reminderDatetime).toLocaleString()}`;

    setTimeout(() => {
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
        } else if (Notification.permission === "granted") {
            showReminder();
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    showReminder();
                }
            });
        }
    }, timeDifference);
});

// Function to show reminder notification
function showReminder() {
    const notification = new Notification("Daily Reminder", {
        body: "Don't forget to check off your habits today!",
        icon: "https://via.placeholder.com/150"
    });

    notification.onclick = () => {
        window.focus();
    };
}

// Function to enable drag-and-drop functionality
function enableDragAndDrop() {
    const habitList = document.getElementById('habit-list');

    // Add event listeners for drag-and-drop
    habitList.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('habit-item')) {
            e.target.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', e.target.dataset.index);
        }
    });

    habitList.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('habit-item')) {
            e.target.classList.remove('dragging');
        }
    });

    habitList.addEventListener('dragover', (e) => {
        e.preventDefault(); // Allow dropping
        const draggingItem = document.querySelector('.dragging');
        const afterElement = getDragAfterElement(habitList, e.clientY);

        if (afterElement == null) {
            habitList.appendChild(draggingItem);
        } else {
            habitList.insertBefore(draggingItem, afterElement);
        }
    });

    habitList.addEventListener('dragenter', (e) => {
        if (e.target.classList.contains('habit-item')) {
            e.target.classList.add('over');
        }
    });

    habitList.addEventListener('dragleave', (e) => {
        if (e.target.classList.contains('habit-item')) {
            e.target.classList.remove('over');
        }
    });

    habitList.addEventListener('drop', () => {
        const habits = Array.from(habitList.querySelectorAll('.habit-item')).map((item) => {
            return JSON.parse(localStorage.getItem('habits'))[item.dataset.index];
        });

        saveHabits(habits); // Save the reordered habits to localStorage
        loadHabits(); // Reload habits to reflect the new order
    });
}

// Helper function to determine where to place the dragged item
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.habit-item:not(.dragging)')];

    return draggableElements.reduce(
        (closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        },
        { offset: Number.NEGATIVE_INFINITY }
    ).element;
}