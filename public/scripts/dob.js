$(() => {
    $("#dob").datepicker({ 
        changeYear: true,
        changeMonth: true,
        yearRange: "-80:-1",
        defaultDate: "-21Y"
    });
});