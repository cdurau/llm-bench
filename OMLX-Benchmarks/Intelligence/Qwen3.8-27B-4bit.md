Intelligence Benchmark Comparison

               Mode    Sampled         Qwen3.8-27B-4bit
-------------------------------------------------------
MMLU           Sample  100/14042                  84.0%
ARC_CHALLENGE  Sample  100/1172                   95.0%
GSM8K          Sample  100/1319                   91.0%
MBPP           Sample  200/500                    84.0%

--- Detail ---

Model: Qwen3.8-27B-4bit
Benchmark         Accuracy   Correct   Total   Time(s)   Think
--------------------------------------------------------------
MMLU                 84.0%        84     100     503.8      No
ARC_CHALLENGE        95.0%        95     100     146.3      No
GSM8K                91.0%        91     100    1044.2      No
  Hit token limit: 9/100 (1 of them scored correct) · Accuracy on finished answers: 98.9% (n = 91)
MBPP                 84.0%       168     200     945.8      No
  Hit token limit: 3/200 (0 of them scored correct) · Accuracy on finished answers: 85.3% (n = 197)
