const constants = {};

constants.secret = '----';
constants.secretNumber = 0;

constants.industries = [
    {
        name: "Marketing and sales"
    },
    {
        name: "Finance"
    },
    {
        name: "Human Resource Management"
    },
    {
        name: "Fashion"
    },
    {
        name: "Entrepreneurship"
    },
    {
        name: "Corporate training"
    },
    {
        name: "Hospitality"
    },
    {
        name: "Science"
    },
    {
        name: "Medicine"
    },
    {
        name: "Art and design"
    },
    {
        name: "Film and music"
    },
    {
        name: "Technology"
    }
];
constants.mentorship_status = [
    "Request has been sent",         // Request Sent
    "Admin has acknowledged"        // Request Acknowledged by Admin
]
constants.internship_status = [
    "Request has been sent",         // Request Sent
    "Admin has acknowledged"        // Request Acknowledged by Admin
]
constants.volunteership_status = [
    "Request has been sent",         // Request Sent
    "Admin has acknowledged"        // Request Acknowledged by Admin
]
constants.cv_builder_status = [
    "Request has been sent",         // Request Sent
    "Admin has acknowledged"        // Request Acknowledged by Admin
]

constants.vaildateEmail = (email) => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

module.exports = constants;