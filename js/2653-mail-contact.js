$(function() {
    // Formspree endpoint
    const FORMSPREE_URL = "https://formspree.io/f/myznyzpa";

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

            // Create form data
            var formData = {
                name: name,
                email: email,
                subject: subject,
                subject2:subject,
                message: message,
                _subject: "New contact from " + name
            };

            // Send AJAX request to Formspree
            $.ajax({
                url: FORMSPREE_URL,
                type: "POST",
                data: formData,
                dataType: "json",
                success: function(data) {
                    // Show success message
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
                },
                error: function(xhr, status, error) {
                    var errorMessage = "Sorry " + name + ", something went wrong. Please try again later!";
                    
                    // Check for specific error messages
                    if (xhr.status === 0) {
                        errorMessage = "Network error. Please check your internet connection.";
                    } else if (xhr.status === 400) {
                        errorMessage = "Please fill all required fields correctly.";
                    } else if (xhr.status === 429) {
                        errorMessage = "Too many requests. Please try again after some time.";
                    }
                    
                    // Show error message
                    $('#success').html("<div class='alert alert-danger'>");
                    $('#success > .alert-danger').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                        .append("</button>");
                    $('#success > .alert-danger').append($("<strong>").html(errorMessage));
                    $('#success > .alert-danger').append('</div>');
                    
                    // Clear form on error too (optional)
                    // $('#contactForm').trigger("reset");
                },
                complete: function() {
                    // Re-enable submit button after 1 second
                    setTimeout(function() {
                        $submitButton.prop("disabled", false);
                    }, 1000);
                }
            });
        },
        filter: function() {
            return $(this).is(":visible");
        },
    });

    // Clear messages when user clicks on name field
    $('#name').focus(function() {
        $('#success').html('');
    });
    
    // Also clear on other fields
    $('#email, #subject, #message').focus(function() {
        $('#success').html('');
    });
    
    // Handle tab navigation
    $("a[data-toggle=\"tab\"]").click(function(e) {
        e.preventDefault();
        $(this).tab("show");
    });
});