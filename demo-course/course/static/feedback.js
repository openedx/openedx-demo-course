// This function sends anonymous feedback to a cloud database for analysis and continuous improvement.
async function sendFeedbackToAPI(unitName, feedback, anonUserId) {
    const url = 'https://hooks.zapier.com/hooks/catch/13921279/3aiz45a/';
    const pathname = window.location.pathname;

    const data = {
        Feedback: feedback,
        PathName: pathname,
        UnitName: unitName,
        AnonUserId: anonUserId
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const responseData = await response.json();
        console.log('Success:', responseData);
    } catch (error) {
        console.error('Error:', error);
        console.log('Error message:', error.message);
    }
}


// Attach event listeners to the buttons
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.emoji-button');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove highlight from all buttons
            buttons.forEach(btn => btn.classList.remove('emoji-button-highlighted'));
            
            // Highlight the clicked button
            this.classList.add('emoji-button-highlighted');

        });
    });
});
