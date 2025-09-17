import supabase from './customSupabaseClient';
import { FallbackCalculations } from './fallbackCalculations';
import { PerformanceMonitor } from './performanceMonitor';

export class NumerologyService {
  static async calculatePersonalMonth({ personalYear, targetMonth, userId, sessionId }) {
    const startTime = performance.now();
    try {
      const { data, error } = await supabase.rpc('calculate_personal_month_safe', {
        p_personal_year: personalYear,
        p_target_month: targetMonth,
      });

      if (error || data === null) {
        throw new Error(error?.message || 'Database calculation failed, using fallback.');
      }
      
      const endTime = performance.now();
      PerformanceMonitor.logCalculation({
        userId,
        sessionId,
        functionName: 'calculate_personal_month_safe',
        inputs: { personalYear, targetMonth },
        result: { personalMonth: data },
        source: 'database',
        executionTimeMs: Math.round(endTime - startTime),
      });

      return data;
    } catch (error) {
      console.warn('Database call failed, using fallback calculation for Personal Month.', error.message);
      
      const fallbackResult = FallbackCalculations.calculatePersonalMonth(personalYear, targetMonth);
      
      const endTime = performance.now();
      PerformanceMonitor.logCalculation({
        userId,
        sessionId,
        functionName: 'calculatePersonalMonth',
        inputs: { personalYear, targetMonth },
        result: { personalMonth: fallbackResult },
        source: 'fallback',
        executionTimeMs: Math.round(endTime - startTime),
      });

      PerformanceMonitor.logError({
        userId,
        sessionId,
        context: 'calculatePersonalMonthFallback',
        error,
        details: { personalYear, targetMonth }
      });

      return fallbackResult;
    }
  }

  static async getInterpretation(number, type) {
    try {
        const { data, error } = await supabase
            .from('number_interpretations')
            .select('*')
            .eq('number', number)
            .eq('type', type)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error(`Error fetching interpretation for ${type} ${number}:`, error);
        return null;
    }
  }
}
