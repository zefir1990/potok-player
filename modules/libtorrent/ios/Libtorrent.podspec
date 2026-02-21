Pod::Spec.new do |s|
  s.name           = 'Libtorrent'
  s.version        = '1.0.0'
  s.summary        = 'A sample project summary'
  s.description    = 'A sample project description'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = {
    :ios => '15.1',
    :tvos => '15.1'
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.vendored_libraries = [
    'libtorrent-ios/libs/libtorrent.a',
    'libtorrent-ios/libs/libboost_system.a',
    'libtorrent-ios/libs/libboost_filesystem.a'
  ]

  s.libraries = 'c++', 'z'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++14',
    'CLANG_CXX_LIBRARY' => 'libc++',
    'HEADER_SEARCH_PATHS' => '"$(PODS_TARGET_SRCROOT)/libtorrent-ios/include/"'
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
