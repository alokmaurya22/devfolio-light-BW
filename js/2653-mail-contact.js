/**
 * Contact form submission.
 *
 * Primary: Formspree. Fallback: Web3Forms (only when Formspree genuinely fails).
 * Both keys are public client-side keys by design.
 */
$(function () {
    // API endpoints
    const FORMSPREE_URL = "https://formspree.io/f/myznyzpa";
    const WEB3FORMS_URL = "https://api.web3forms.com/submit";
    const WEB3FORMS_ACCESS_KEY = "7c987ec4-6a93-41c8-8241-e6debb218535";

    const $status = $('#success');
    const $submitButton = $("#sendMessageButton");

    function setBusy(busy) {
        $submitButton.prop("disabled", busy);
    }

    // The status box used to be left with display:none by a fadeOut, which made every
    // message after the first one invisible. Always re-show it before writing.
    function showMessage(type, text) {
        $status
            .stop(true, true)
            .empty()
            .show()
            .html(
                $('<div>')
                    .addClass('alert alert-' + type + ' alert-dismissible')
                    .attr('role', 'alert')
                    .append($('<strong>').text(text))
                    .append(
                        $('<button>')
                            .attr({ type: 'button', 'class': 'close', 'data-dismiss': 'alert', 'aria-label': 'Close' })
                            .append($('<span>').attr('aria-hidden', 'true').html('&times;'))
                    )
            );
    }

    function showSuccessMessage() {
        showMessage('success', 'Thank you! Your message has been sent successfully.');
        $('#contactForm').trigger("reset");
        setTimeout(function () { $status.fadeOut('slow'); }, 5000);
    }

    function showErrorMessage(errorText) {
        showMessage('danger', errorText || 'Something went wrong. Please try again later!');
    }

    $("#contactForm input, #contactForm textarea").jqBootstrapValidation({
        preventSubmit: true,
        submitError: function ($form, event, errors) {
            // Validation messages are rendered by jqBootstrapValidation itself.
        },
        submitSuccess: function ($form, event) {
            event.preventDefault();

            // Honeypot: only bots fill this in. Pretend it worked, send nothing.
            if ($("#_gotcha").val()) {
                showSuccessMessage();
                return;
            }

            // Get form values
            var name = $("input#name").val();
            var email = $("input#email").val();
            var subject = $("input#subject").val();
            var message = $("textarea#message").val();

            setBusy(true);

            // Fallback path - only reached when Formspree actually failed.
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
                    success: function (response) {
                        if (response && response.success) {
                            showSuccessMessage();
                        } else {
                            showErrorMessage("Form submission failed. Please try again.");
                        }
                    },
                    error: function () {
                        showErrorMessage("Unable to send message. Please email me directly at er.alokmaurya22@gmail.com");
                    },
                    complete: function () {
                        setBusy(false);
                    }
                });
            }

            // First try Formspree.
            // The Accept header is required: without it Formspree answers an AJAX POST
            // with an HTML redirect, jQuery reports a parse error, and the old code fell
            // through to Web3Forms even though the message had already been delivered -
            // sending every message twice.
            $.ajax({
                url: FORMSPREE_URL,
                type: "POST",
                headers: { Accept: "application/json" },
                data: {
                    name: name,
                    email: email,
                    subject: subject,
                    subjects: subject,
                    message: message,
                    _subject: "New contact from " + name
                },
                dataType: "json",
                success: function () {
                    showSuccessMessage();
                    setBusy(false);
                },
                error: function () {
                    // Genuine failure - try the backup endpoint, which re-enables the button.
                    sendViaWeb3Forms();
                }
            });
        },
        filter: function () {
            return $(this).is(":visible");
        }
    });

    // Clear messages when the user starts correcting the form.
    $('#name, #email, #subject, #message').on('focus', function () {
        $status.stop(true, true).empty().hide();
    });
});
