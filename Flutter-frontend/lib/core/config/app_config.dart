class AppConfig {
  static const String appName = 'TaskFlow';
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:4000',
  );
  static const int defaultPageSize = 10;
}
