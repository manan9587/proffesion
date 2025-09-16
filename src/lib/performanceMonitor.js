import { supabase } from './customSupabaseClient';
import FeatureFlags from './featureFlags';

export class PerformanceMonitor {
  static async logCalculation({ userId, sessionId, functionName, inputs, result, source, executionTimeMs }) {
    if (!FeatureFlags.ENABLE_PERFORMANCE_MONITOR) return;

    try {
      await supabase.from('calculation_logs').insert({
        user_id: userId,
        session_id: sessionId,
        function_name: functionName,
        inputs,
        result,
        source,
        execution_time_ms: executionTimeMs,
      });
    } catch (error) {
      console.error('Error logging calculation:', error);
    }
  }

  static async logError({ userId, sessionId, context, error, details }) {
    if (!FeatureFlags.ENABLE_PERFORMANCE_MONITOR) return;

    try {
      await supabase.from('error_logs').insert({
        user_id: userId,
        session_id: sessionId,
        context,
        error_message: error.message,
        stack_trace: error.stack,
        details,
      });
    } catch (dbError) {
      console.error('Error logging error to DB:', dbError);
    }
  }
}