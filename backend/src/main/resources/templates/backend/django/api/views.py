from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


@api_view(['GET'])
def health(request):
    """
    Health check endpoint
    """
    return Response({
        'status': 'ok'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def api_status(request):
    """
    Status endpoint
    """
    return Response('starting', status=status.HTTP_200_OK)


@api_view(['GET'])
def metrics(request):
    """
    Metrics endpoint
    """
    response_data = {
        'metrics': [
            {
                'name': 'requestCount',
                'value': 100
            },
            {
                'name': 'requestsBlocked',
                'value': 20
            }
        ]
    }
    return Response(response_data, status=status.HTTP_200_OK)
