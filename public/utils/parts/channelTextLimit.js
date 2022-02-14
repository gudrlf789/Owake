$(document).on("keyup", "#update_channel-description", function () {
    $("#text_cnt").html("(" + $(this).val().length + " / 50)");
    if ($(this).val().length > 50) {
        alert("You can enter up to 50 characters.");
        $(this).val($(this).val().substring(0, 50));
        $("#text_cnt").html("(50 / 50)");
    }
});

$(document).on("keyup", "#private_channel-description", function () {
    $("#text_cnt").html("(" + $(this).val().length + " / 50)");
    if ($(this).val().length > 50) {
        alert("You can enter up to 50 characters.");
        $(this).val($(this).val().substring(0, 50));
        $("#text_cnt").html("(50 / 50)");
    }
});

$(document).on("keyup", "#public_channel-description", function () {
    $("#text_cnt").html("(" + $(this).val().length + " / 50)");
    if ($(this).val().length > 50) {
        alert("You can enter up to 50 characters.");
        $(this).val($(this).val().substring(0, 50));
        $("#text_cnt").html("(50 / 50)");
    }
});
