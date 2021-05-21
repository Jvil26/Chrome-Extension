    document.addEventListener('yourCustomEvent', function (e) {
        var data = e.detail;
        const keyEvent = document.createEvent('Event')
  keyEvent.initEvent('keypress', true, true)
  keyEvent.key = 'a' // A key like 'a' or 'B' or 'Backspace'
  // You will need to change this line if you want to use other special characters such as the left and right arrows; or you can just use this line without the .key line I think
  keyEvent.keyCode = 'a' === 'Backspace' ? 8 : 'a'.charCodeAt(0) 
  document.querySelector('.docs-texteventtarget-iframe').contentDocument.activeElement
    .dispatchEvent(keyEvent)
        console.log('received', data);
      });