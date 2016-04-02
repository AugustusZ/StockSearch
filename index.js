function resetForm() {
    // CLEAR button: This button must clear the text field, resets the carousel to the favorite list and clear all validation errors if present.

    // 1 clear the text field and set focus
    $("[type=text]").val("");
    $("#inputText").focus();

    // 2 resets the carousel
    $("#myCarousel").carousel(0);

    // 3 clear all validation errors
    $("#validationMessage").html("");
}
