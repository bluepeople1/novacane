var SecTaskCopyValueForEntitlement = Module.findExportByName(null, 'SecTaskCopyValueForEntitlement')
var SecTaskCopyValuesForEntitlements = Module.findExportByName(null, 'SecTaskCopyValuesForEntitlements')
var CFRelease = new NativeFunction(Module.findExportByName(null, 'CFRelease'), 'void', ['pointer'])
var CFStringGetCStringPtr = new NativeFunction(Module.findExportByName(null, 'CFStringGetCStringPtr'), 'pointer', ['pointer', 'uint32'])
var kCFStringEncodingUTF8 = 0x08000100
var expected = [
  'com.apple.security.get-task-allow',
  'com.apple.private.webinspector.allow-remote-inspection',
  'com.apple.private.webinspector.allow-carrier-remote-inspection',
  'com.apple.webinspector.allow'
];
Interceptor.attach(SecTaskCopyValueForEntitlement, {
  onEnter: function (args) {
    var p = CFStringGetCStringPtr(args[1], kCFStringEncodingUTF8)
    var ent = Memory.readUtf8String(p)
    var description = new ObjC.Object(args[0])
    console.log('inspector for', description)
    if (expected.indexOf(ent) > -1) {
      this.shouldOverride = true
      console.log('enable inspector for', description)
    }
  },
  onLeave: function (retVal) {
    if (!this.shouldOverride)
      return

    if (!retVal.isNull())
      CFRelease(retVal)

    retVal.replace(ObjC.classes.NSNumber.numberWithBool_(1))
  }
})


Interceptor.attach(SecTaskCopyValuesForEntitlements, {
  onEnter: function (args) {
    var description = new ObjC.Object(args[0])
    console.log('inspectors for', description)

  },
  onLeave: function (retVal) {

  }
})
