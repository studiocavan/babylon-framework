from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from prometheus_client import Counter

# Define custom metrics
request_counter = Counter('api_requests_total', 'Total number of API requests')
blocked_counter = Counter('api_requests_blocked', 'Number of blocked requests')


@api_view(['GET'])
def health(request):
    """
    Health check endpoint
    """
    request_counter.inc()
    return Response({
        'status': 'ok'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def api_status(request):
    """
    Status endpoint
    """
    request_counter.inc()
    return Response('starting', status=status.HTTP_200_OK)


@api_view(['GET'])
def metrics(request):
    """
    Metrics endpoint (JSON format)
    """
    request_counter.inc()
    response_data = {
        'metrics': [
            {
                'name': 'requestCount',
                'value': int(request_counter._value.get())
            },
            {
                'name': 'requestsBlocked',
                'value': int(blocked_counter._value.get())
            }
        ]
    }
    return Response(response_data, status=status.HTTP_200_OK)


@api_view(['POST'])
def simulate_block(request):
    """
    Simulate a blocked request
    """
    blocked_counter.inc()
    return Response({
        'message': 'Request blocked'
    }, status=status.HTTP_200_OK)
