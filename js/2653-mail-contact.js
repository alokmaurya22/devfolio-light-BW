$(function() {
    // API endpoints
    const FORMSPREE_URL = "https://formspree.io/f/myznyzpa";
    const WEB3FORMS_URL = "https://api.web3forms.com/submit";
    const WEB3FORMS_ACCESS_KEY = "7c987ec4-6a93-41c8-8241-e6debb218535";

    $("#contactForm input, #contactForm textarea").jqBootstrapValidation({
        preventSubmit: true,
        submitError: function($form, event, errors) {
            // Handle validation errors
        },
        submitSuccess: function($form, event) {
            event.preventDefault();
            
            // Get form values
            var name = $("input#name").val();
            var email = $("input#email").val();
            var subject = $("input#subject").val();
            var message = $("textarea#message").val();

            // Disable submit button
            var $submitButton = $("#sendMessageButton");
            $submitButton.prop("disabled", true);

            // Function to send via Web3Forms
            function sendViaWeb3Forms() {
                var web3FormData = {
                    access_key: WEB3FORMS_ACCESS_KEY,
                    name: name,
                    email: email,
                    subject: subject,
                    subjects: subject,
                    message: message,
                    from_name: "Portfolio Contact Form"
                };

                $.ajax({
                    url: WEB3FORMS_URL,
                    type: "POST",
                    data: JSON.stringify(web3FormData),
                    contentType: "application/json",
                    dataType: "json",
                    success: function(response) {
                        if (response.success) {
                            showSuccessMessage();
                        } else {
                            showErrorMessage("Form submission failed. Please try again.");
                        }
                    },
                    error: function() {
                        showErrorMessage("Unable to send message. Please try again later.");
                    },
                    complete: function() {
                        setTimeout(function() {
                            $submitButton.prop("disabled", false);
                        }, 1000);
                    }
                });
            }

            // Function to show success message
            function showSuccessMessage() {
                $('#success').html("<div class='alert alert-success'>");
                $('#success > .alert-success').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                    .append("</button>");
                $('#success > .alert-success')
                    .append("<strong>Thank you! Your message has been sent successfully. </strong>");
                $('#success > .alert-success')
                    .append('</div>');
                
                // Clear form
                $('#contactForm').trigger("reset");
                
                // Auto hide success message after 5 seconds
                setTimeout(function() {
                    $('#success').fadeOut('slow');
                }, 5000);
            }

            // Function to show error message
            function showErrorMessage(errorText) {
                $('#success').html("<div class='alert alert-danger'>");
                $('#success > .alert-danger').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                    .append("</button>");
                $('#success > .alert-danger').append($("<strong>").html(errorText || "Sorry " + name + ", something went wrong. Please try again later!"));
                $('#success > .alert-danger').append('</div>');
            }

            // First try Formspree
            var formspreeData = {
                name: name,
                email: email,
                subject: subject,
                subjects: subject,
                message: message,
                _subject: "New contact from " + name,
            };

            $.ajax({
                url: FORMSPREE_URL,
                type: "POST",
                data: formspreeData,
                dataType: "json",
                success: function(data) {
                    showSuccessMessage();
                },
                error: function(xhr, status, error) {
                    console.log("Formspree failed, trying Web3Forms...");
                    // If Formspree fails, try Web3Forms
                    sendViaWeb3Forms();
                },
                complete: function() {
                    // Don't re-enable button here, let individual handlers do it
                }
            });
        },
        filter: function() {
            return $(this).is(":visible");
        },
    });

    // Clear messages when user clicks on any form field
    $('#name, #email, #subject, #message').focus(function() {
        $('#success').html('');
    });
    
    // Handle tab navigation
    $("a[data-toggle=\"tab\"]").click(function(e) {
        e.preventDefault();
        $(this).tab("show");
    });
});